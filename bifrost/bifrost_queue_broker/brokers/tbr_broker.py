# Broker imports
import sys
import logging
from .broker import Broker
from .queue_status import ProcessingStatus

# TBR API imports
import time
import api_clients.tbr_client
from pprint import pprint
from api_clients.tbr_client.api import isolate_api
from api_clients.tbr_client.model.isolate import Isolate
from api_clients.tbr_client.model.isolate_update import IsolateUpdate
from api_clients.tbr_client.model.problem_details import ProblemDetails

tbr_configuration = api_clients.tbr_client.Configuration(host="http://localhost:5000")


class TBRBroker(Broker):
    def __init__(self, collection):
        self.broker_name = "TBR Broker"
        self.find_matcher = {"status": ProcessingStatus.WAITING.value, "service": "TBR"}
        super(TBRBroker, self).__init__(
            collection,
            self.broker_name,
            self.find_matcher,
            TBRBroker.handle_tbr_request,
        )

    # This function gets called with the body of every TBR request from the queue.
    def handle_tbr_request(request):
        logging.info(request)
        with api_clients.tbr_client.ApiClient(configuration) as api_client:
            api_instance = isolate_api.IsolateApi(api_client)
            isolate_id = "1"  # str, none_type |

            try:
                api_response = api_instance.api_isolate_isolate_id_get(isolate_id)
                pprint(api_response)
            except api_clients.tbr_client.ApiException as e:
                print(
                    "Exception when calling IsolateApi->api_isolate_isolate_id_get: %s\n"
                    % e
                )
