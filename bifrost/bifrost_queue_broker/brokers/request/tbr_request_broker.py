# Broker imports
import sys, os
import logging
from ..shared import (
    BrokerError,
    ProcessingStatus,
    tbr_column_mappings as column_mapping,
    reverse_tbr_column_mapping as reverse_column_mapping,
)
from ..tbr_conn import get_tbr_configuration
from .request_broker import RequestBroker
from common.database import encrypt_dict, get_connection
from common.config.column_config import pii_columns

# TBR API imports
import time
import api_clients.tbr_client
from pymongo.collection import ReturnDocument
from pprint import pprint
from api_clients.tbr_client.api import isolate_api
from api_clients.tbr_client.models import (
    Isolate,
    IsolateUpdate,
    ProblemDetails,
)

tbr_api_url = os.environ.get("TBR_API_URL")

tbr_configuration = api_clients.tbr_client.Configuration(host=tbr_api_url)


class TBRRequestBroker(RequestBroker):
    def __init__(self, data_lock, queue_col_name, tbr_col_name, db):
        self.data_lock = data_lock
        self.broker_name = "TBR Broker"
        self.find_matcher = {"status": ProcessingStatus.WAITING.value, "service": "TBR"}
        self.db = db
        self.tbr_col = self.db[tbr_col_name]
        _, enc = get_connection(with_enc=True)
        self.encryption_client = enc

        super(TBRRequestBroker, self).__init__(
            self.db,
            self.db[queue_col_name],
            self.broker_name,
            self.find_matcher,
            self.handle_tbr_request,
        )

    # This function gets called with the body of every TBR request from the queue.
    def handle_tbr_request(self, request):
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

        with api_clients.tbr_client.ApiClient(get_tbr_configuration()) as api_client:
            api_instance = isolate_api.IsolateApi(api_client)
            try:
                logging.debug(f"Requesting metadata from TBR for: {isolate_id}")
                api_response = api_instance.api_isolate_isolate_id_get(isolate_id)
                logging.debug(f"TBR responded with {api_response}")
                values = api_response.to_dict()
                if "isolate_id" in values:
                    del values["isolate_id"]

                values = {column_mapping[k]: v for k, v in values.items()}
                encrypt_dict(self.encryption_client, values, pii_columns())

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
                    f"Exception on isolate {isolate_id} unable to fetch from TBR: {e}\n"
                )
                raise BrokerError

    def approve_fields(self, request):
        isolate_id = request["isolate_id"]

        if body := request["body"]:
            fields = body.copy()

            mapped_request = {
                reverse_column_mapping[k]: v
                for k, v in fields.items()
                if reverse_column_mapping.normal_get(k) and v
            }
            mapped_request["isolate_id"] = isolate_id
            # del mapped_request["sequence_id"]

            with api_clients.tbr_client.ApiClient(
                get_tbr_configuration()
            ) as api_client:
                api_instance = isolate_api.IsolateApi(api_client)
                try:
                    logging.debug(f"Sending to TBR: {mapped_request}")
                    api_response = api_instance.api_isolate_put(
                        isolate_update=mapped_request
                    )
                    logging.debug(f"Api responded with: {api_response}")
                except Exception as e:
                    logging.info(
                        f"Exception on isolate {isolate_id} when calling IsolateApi->api_isolate_put: {e}\n"
                    )
                    raise BrokerError
