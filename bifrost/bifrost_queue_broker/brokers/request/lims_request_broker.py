import os, sys
import logging
from ..shared import (
    BrokerError,
    ProcessingStatus,
    lims_column_mapping as column_mapping,
    reverse_lims_column_mapping as reverse_column_mapping,
)
from ..lims_conn import *
from .request_broker import RequestBroker
from common.database import encrypt_dict, get_connection
from common.config.column_config import pii_columns

# LIMS API imports
import time
import api_clients.lims_client
from api_clients.lims_client.api import connections_api, isolate_api
from api_clients.lims_client.models import (
    IsolateGetRequest,
    IsolateGetResponse,
    IsolateUpdateRequest,
    IsolateUpdateResponse,
    ConnectionCreateRequest,
    ConnectionCreateResponse,
    DataEntry,
    DataFieldName,
)


class LIMSRequestBroker(RequestBroker):
    def __init__(self, data_lock, queue_col_name, lims_col_name, db):
        self.data_lock = data_lock
        self.broker_name = "LIMS Broker"
        self.find_matcher = {
            "status": ProcessingStatus.WAITING.value,
            "service": "LIMS",
        }
        self.db = db
        self.lims_col = self.db[lims_col_name]
        _, enc = get_connection(with_enc=True)
        self.encryption_client = enc

        super(LIMSRequestBroker, self).__init__(
            self.db,
            self.db[queue_col_name],
            self.broker_name,
            self.find_matcher,
            self.handle_lims_request,
        )

    # This function gets called with the body of every LIMS request from the queue.
    def handle_lims_request(self, request):
        self.data_lock.acquire()
        try:
            if "isolate_id" in request and "request_type" in request:
                # TODO: Typed request types, and general annotations everywhere..
                if request["request_type"] == "fetch":
                    self.fetch_and_update_isolate_metadata(request)
                elif request["request_type"] == "approve":
                    self.approve_fields(request)
        except:
            raise
        finally:
            self.data_lock.release()

    def fetch_and_update_isolate_metadata(self, request):
        isolate_id = request["isolate_id"]

        conn_id, lms_cfg = create_lims_conn_config()

        with api_clients.lims_client.ApiClient(lms_cfg) as api_client:
            api_instance = isolate_api.IsolateApi(api_client)
            try:
                isolate_get_req = IsolateGetRequest(isolate_id=isolate_id)
                api_response = api_instance.post_actions_get_isolate(
                    isolate_get_request=isolate_get_req
                )
                if "output" in api_response and "sapresponse" in api_response.output:
                    values = transform_lims_metadata(api_response)
                    isolate_id = values["isolate_id"]
                    encrypt_dict(self.encryption_client, values, pii_columns())

                    result = self.lims_col.find_one_and_update(
                        {"isolate_id": isolate_id}, {"$set": values}, upsert=True
                    )
                    logging.info(result)
            except Exception as e:
                logging.error(
                    f"Exception on isolate {isolate_id} unable to fetch from LIMS: {e}\n"
                )
                raise BrokerError

        close_lims_connection(conn_id, lms_cfg)

    def approve_fields(self, request):
        sequence_id = request["sequence_id"]
        isolate_id = request["isolate_id"]

        if body := request["body"]:
            fields = body.copy()
            logging.debug(f"Passed fields from approval: {fields}")

            mapped_request = {
                reverse_column_mapping[k]: v
                for k, v in fields.items()
                if reverse_column_mapping.normal_get(k)
            }
            logging.debug(f"Reverse-mapped request: {mapped_request}")
            conn_id, lms_cfg = create_lims_conn_config()

            value_set = set(DataFieldName.allowed_values[("value",)].values())
            data = [
                DataEntry(field_name=DataFieldName(value=k), field_value=str(v))
                for k, v in mapped_request.items()
                if k in value_set and v is not None and v is not ""
            ]
            with api_clients.lims_client.ApiClient(lms_cfg) as api_client:
                req = IsolateUpdateRequest(isolate_id=isolate_id, data=data)
                api_instance = isolate_api.IsolateApi(api_client)
                try:
                    logging.debug(f"Sending isolate update request to LIMS: {req}")
                    api_response = api_instance.post_actions_update_isolate(
                        isolate_update_request=req
                    )
                    logging.debug(f"LIMS Api responded with: {api_response}")
                    if (
                        "output" in api_response
                        and "sapresponse" in api_response.output
                        and (
                            (
                                "succcess" in api_response.output.sapresponse
                                and not api_response.output.sapresponse.succcess
                            )
                            or (
                                "success" in api_response.output.sapresponse
                                and not api_response.output.sapresponse.success
                            )
                            or api_response.status == "Released"
                        )
                    ):
                        raise BrokerError

                except BrokerError:
                    raise
                except Exception as e:
                    logging.error(
                        f"Exception on isolate {sequence_id} update request: {e}\n"
                    )
                    close_lims_connection(conn_id, lms_cfg)
                    raise BrokerError

            close_lims_connection(conn_id, lms_cfg)
