import sys
import logging
from .broker import Broker
from .queue_status import ProcessingStatus


class LIMSBroker(Broker):
    def __init__(self, collection_name, db):
        self.broker_name = "LIMS Broker"
        self.find_matcher = {
            "status": ProcessingStatus.WAITING.value,
            "service": "LIMS",
        }
        super(LIMSBroker, self).__init__(
            db,
            db[collection_name],
            self.broker_name,
            self.find_matcher,
            self.handle_lims_request,
        )

    # This function gets called with the body of every LIMS request from the queue.
    def handle_lims_request(self, request):
        logging.info(request)
