import os, sys, requests

# from ...api_clients.lims_client.api import connections_api
from requests.exceptions import ConnectionError
from ...generated.models.health_status import HealthStatus

# from SAP.web.src.SAP.generated.models.health_status import HealthStatus
from flask import abort
from flask.json import jsonify

lims_api_url = os.environ.get("LIMS_API_URL")
lims_api_databaseid = os.environ.get("LIMS_API_DATABASEID")
lims_api_username = os.environ.get("LIMS_API_USERNAME")
lims_api_password = os.environ.get("LIMS_API_PASSWORD")

tbr_api_url = os.environ.get("TBR_API_URL")
tbr_api_key = os.environ.get("TBR_CLIENT_KEY")
tbr_api_cert = os.environ.get("TBR_CLIENT_CERT")
tbr_api_root = os.environ.get("TBR_ROOT_CA")

# lims_configuration = api_clients.lims_client.Configuration(host=lims_api_url)


def health_ext_lims(user, token):
    payload = {
        "databaseid": lims_api_databaseid,
        "username": lims_api_username,
        "password": lims_api_password,
    }
    try:
        r = requests.post(f"{lims_api_url}/connections", json=payload)
        if r.ok:
            return jsonify({"description": "OK", "status": HealthStatus.HEALTHY})
        r.raise_for_status()
    except requests.exceptions.HTTPError as e:
        return jsonify({"description": f"LIMS HTTP Error: {e}", "status": HealthStatus.UNHEALTHY}), 200
    except ConnectionError as e:
        return jsonify({"description": f"LIMS Connection Error: {e}", "status": HealthStatus.UNHEALTHY}), 200
    except requests.exceptions.Timeout as e:
        return jsonify({"description": f"LIMS Timeout Error: {e}", "status": HealthStatus.UNHEALTHY}), 200
    except Exception as e:
        return jsonify({"description": f"LIMS Exception: {e}", "status": HealthStatus.UNHEALTHY}), 200


def health_ext_tbr(user, token):
    url = f"{tbr_api_url}/index.html"
    try:
        r = requests.get(url, verify=tbr_api_root, cert=(tbr_api_cert, tbr_api_key))
        if r.ok:
            return jsonify({"description": "OK", "status": HealthStatus.HEALTHY})            
        r.raise_for_status()
    except requests.exceptions.HTTPError as e:
        return jsonify({"description": f"TBR HTTP Error: {e}", "status": HealthStatus.UNHEALTHY}), 200
    except ConnectionError as e:
        return jsonify({"description": f"TBR Connection Error: {e}", "status": HealthStatus.UNHEALTHY}), 200
    except requests.exceptions.Timeout as e:
        return jsonify({"description": f"TBR Timeout Error: {e}", "status": HealthStatus.UNHEALTHY}), 200
    except Exception as e:
        return jsonify({"description": f"TBR Exception: {e}", "status": HealthStatus.UNHEALTHY}), 200


def system_health(user, token):
    status = {}
    return jsonify(status)

    # with api_clients.tbr_client.ApiClient(get_tbr_configuration()) as api_client:
    #         api_instance = isolate_api.IsolateApi(api_client)
    #         try:
    #             logging.debug(f"Requesting metadata from TBR for: {isolate_id}")
    #             api_response = api_instance.api_isolate_isolate_id_get(isolate_id)
    #             logging.debug(f"TBR responded with {api_response}")
    #             response_dict = api_response.to_dict()
    #             if "isolate_id" in response_dict:
    #                 del response_dict["isolate_id"]

    #             values = {
    #                 column_mapping[k]: v
    #                 for k, v in response_dict.items()
    #                 if column_mapping.normal_get(k)
    #             }

    #             logging.debug(f"TBR mapped result: {values}")

    #             encrypt_dict(self.encryption_client, values, pii_columns())

    #             # TODO: make sure this hardocded collection name is correct, or take form env variables.
    #             result = self.tbr_col.find_one_and_update(
    #                 filter={"isolate_id": isolate_id},
    #                 update={"$set": values},
    #                 return_document=ReturnDocument.AFTER,
    #                 upsert=True,
    #             )
    #             logging.info(result)
    #         except Exception as e:
    #             logging.error(
    #                 f"Exception on isolate {isolate_id} unable to fetch from TBR: {e}\n"
    #             )
    #             raise BrokerError
    # connection_id = None

    # with api_clients.lims_client.ApiClient(lims_configuration) as api_client:
    #     # Create an instance of the API class
    #     conn_create_instance = connections_api.ConnectionsApi(api_client)
    #     conn_req = ConnectionCreateRequest(
    #         databaseid=lims_api_databaseid,
    #         username=lims_api_username,
    #         password=lims_api_password,
    #     )
    #     connection_id = None
    #     try:
    #         api_response: ConnectionCreateResponse = (
    #             conn_create_instance.post_connections(
    #                 connection_create_request=conn_req
    #             )
    #         )
    #         connection_id = api_response.connections.connectionid
    #     except api_clients.lims_client.ApiException as e:
    #         print("Exception when creating connection: %s\n" % e)
    #         status["lims"] = False

    #     # lms_cfg = api_clients.lims_client.Configuration(
    #     #     host=lims_api_url, api_key={"cookieAuth": f"connectionid={connection_id}"}
    #     # )

    #     if connection_id != None:
    #         status["lims"] = True
    #     else:
    #         status["lims"] = False
