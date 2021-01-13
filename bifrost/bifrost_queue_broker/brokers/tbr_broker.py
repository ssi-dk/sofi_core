# Broker imports
import sys, os
import logging
from .broker import Broker, BrokerError
from .queue_status import ProcessingStatus

# TBR API imports
import time
import api_clients.tbr_client
from pprint import pprint
from api_clients.tbr_client.api import isolate_api
from api_clients.tbr_client.model.isolate import Isolate
from api_clients.tbr_client.model.isolate_update import IsolateUpdate
from api_clients.tbr_client.model.problem_details import ProblemDetails

tbr_api_url = os.environ.get("TBR_API_URL", "http://localhost:5000")

tbr_configuration = api_clients.tbr_client.Configuration(host=tbr_api_url)


class TBRBroker(Broker):
    def __init__(self, collection):
        self.broker_name = "TBR Broker"
        self.find_matcher = {"status": ProcessingStatus.WAITING.value, "service": "TBR"}
        super(TBRBroker, self).__init__(
            collection,
            self.broker_name,
            self.find_matcher,
            self.handle_tbr_request,
        )

    # This function gets called with the body of every TBR request from the queue.
    def handle_tbr_request(self, request):
        logging.info(request)

        if "isolate_id" in request and "request_type" in request:
            if request["request_type"] == "get":
                self.get_isolate_data(request)
            elif request["request_type"] == "approve":
                self.approve_fields(request)

    def get_isolate_data(self, request):
        isolate_id = request["isolate_id"]

        with api_clients.tbr_client.ApiClient(tbr_configuration) as api_client:
            api_instance = isolate_api.IsolateApi(api_client)
            try:
                api_response = api_instance.api_isolate_isolate_id_get(
                    isolate_id, async_req=True
                )
                logging.info(api_response)
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
                    api_response = api_instance.api_isolate_put(
                        isolate_update=body, async_req=True
                    )
                    logging.info(api_response)
                except Exception as e:
                    logging.info(
                        f"Exception on isolate {isolate_id} when calling IsolateApi->api_isolate_put: {e}\n"
                    )
                    raise BrokerError
