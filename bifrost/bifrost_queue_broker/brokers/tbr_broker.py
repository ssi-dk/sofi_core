import sys
import logging
from .broker import Broker
from .queue_status import ProcessingStatus


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
