import sys
import logging
from .broker import Broker
from .queue_status import ProcessingStatus


class LIMSBroker(Broker):
    def __init__(self, db_name, collection_name):
        self.broker_name = "LIMS Broker"
        self.find_matcher = {
            "status": ProcessingStatus.WAITING.value,
            "service": "LIMS",
        }
        super(LIMSBroker, self).__init__(
            db_name,
            collection_name,
            self.broker_name,
            self.find_matcher,
            LIMSBroker.handle_tbr_request,
        )

    # This function gets called with the body of every LIMS request from the queue.
    def handle_tbr_request(request):
        logging.info(request)
