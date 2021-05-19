import os, sys
import time
import api_clients.lims_client
from api_clients.lims_client.api import connections_api
from api_clients.lims_client.models import (
    ConnectionCreateRequest,
    ConnectionCreateResponse,
    IsolateGetResponse,
)

from .shared import lims_column_mapping as column_mapping

lims_api_url = os.environ.get("LIMS_API_URL")
lims_api_databaseid = os.environ.get("LIMS_API_DATABASEID")
lims_api_username = os.environ.get("LIMS_API_USERNAME")
lims_api_password = os.environ.get("LIMS_API_PASSWORD")

lims_configuration = api_clients.lims_client.Configuration(host=lims_api_url)


def transform_lims_metadata(lims_metadata: IsolateGetResponse):
    metadata = {
        column_mapping[md.meta_field_name.value]: md.meta_field_value
        for md in lims_metadata.output.sapresponse.metadata
    }
    data = {
        column_mapping[d.field_name.value]: d.field_value
        for d in lims_metadata.output.sapresponse.data
    }
    return {
        "isolate_id": lims_metadata.output.sapresponse.isolate_id,
        **metadata,
        **data,
    }


def create_lims_conn_config():
    connection_id = None
    with api_clients.lims_client.ApiClient(lims_configuration) as api_client:
        # Create an instance of the API class
        conn_create_instance = connections_api.ConnectionsApi(api_client)
        conn_req = ConnectionCreateRequest(
            databaseid=lims_api_databaseid,
            username=lims_api_username,
            password=lims_api_password,
        )
        connection_id = None
        try:
            api_response: ConnectionCreateResponse = (
                conn_create_instance.post_connections(
                    connection_create_request=conn_req
                )
            )
            connection_id = api_response.connections.connectionid
        except api_clients.lims_client.ApiException as e:
            print("Exception when creating connection: %s\n" % e)

    lms_cfg = api_clients.lims_client.Configuration(
        host=lims_api_url, api_key={"cookieAuth": f"connectionid={connection_id}"}
    )

    return connection_id, lms_cfg


def close_lims_connection(connection_id, lms_cfg):
    with api_clients.lims_client.ApiClient(lms_cfg) as api_client:
        conn_delete_instance = connections_api.ConnectionsApi(api_client)
        try:
            conn_delete_instance.delete_connections(connection_id=connection_id)
        except api_clients.lims_client.ApiException as e:
            print("Exception when deleting connection: %s\n" % e)
