import sys
import logging
from ..shared import BrokerError, ProcessingStatus
from .request_broker import RequestBroker


class LIMSRequestBroker(RequestBroker):
    def __init__(self, data_lock, queue_col_name, lims_col_name, db):
        self.broker_name = "LIMS Broker"
        self.find_matcher = {
            "status": ProcessingStatus.WAITING.value,
            "service": "LIMS",
        }
        self.db = db
        self.lims_col = self.db[lims_col_name]

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
