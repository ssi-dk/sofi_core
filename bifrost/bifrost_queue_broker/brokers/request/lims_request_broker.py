import os, sys
import logging
from ..shared import BrokerError, ProcessingStatus
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
    ConnectionCreateRequest,
    ConnectionCreateResponse,
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
        logging.info(request)

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


"""
     with api_clients.tbr_client.ApiClient(tbr_configuration) as api_client:
            api_instance = isolate_api.IsolateApi(api_client)
            try:
                api_response = api_instance.api_isolate_isolate_id_get(isolate_id)
                values = api_response.to_dict()
                if "isolate_id" in values:
                    del values["isolate_id"]

                # TODO: make sure this hardocded collection name is correct, or take form env variables.
                result = self.tbr_col.find_one_and_update(
                    filter={"isolate_id": isolate_id},
                    update={"$set": values},
                    return_document=ReturnDocument.AFTER,
                    upsert=True,
                )
                logging.info(result)
            except Exception as e:
                logging.error(
                    f"Exception on isolate {isolate_id} IsolateApi->api_isolate_isolate_id_get: {e}\n"
                )
                raise BrokerError

    def approve_fields(self, request):
        isolate_id = request["isolate_id"]
        if "body" in request:
            body = request["body"]

            with api_clients.tbr_client.ApiClient(tbr_configuration) as api_client:
                api_instance = isolate_api.IsolateApi(api_client)
                try:
                    api_response = api_instance.api_isolate_put(isolate_update=body)
                    logging.info(api_response)
                except Exception as e:
                    logging.info(
                        f"Exception on isolate {isolate_id} when calling IsolateApi->api_isolate_put: {e}\n"
                    )
                    raise BrokerError
"""
