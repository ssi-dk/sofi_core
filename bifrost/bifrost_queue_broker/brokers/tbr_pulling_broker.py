import os, sys
import logging
import time
import pymongo
import threading
from pymongo import CursorType
from .queue_status import ProcessingStatus
from .broker import BrokerError

# TBR API imports
import time
import api_clients.tbr_client
from pymongo.collection import ReturnDocument
from pprint import pprint
from api_clients.tbr_client.api.isolate_api import ApiClient, IsolateApi
from api_clients.tbr_client.model.isolate import Isolate
from api_clients.tbr_client.model.row_version import RowVersion


tbr_api_url = os.environ.get("TBR_API_URL", "http://localhost:5000")

tbr_configuration = api_clients.tbr_client.Configuration(host=tbr_api_url)

class TBRPullingBroker(threading.Thread):
    def __init__(self, db, _col):
        super(TBRPullingBroker, self).__init__()
        self.db = db
        self.col = db["sap_analysis_results"]
        self.stop = threading.Event()
        self.broker_name = "TBR Pulling broker"

    def stop(self):
        self.stop.set()

    def run(self):
        logging.info(f"Started {self.broker_name} thread.")
        interval = 60*10 # 10 minutes
        first_run = True
        while first_run or not self.stop.wait(interval):
            first_run = False
            self.run_sync_job()

    def run_sync_job(self):
        batch_size = 200
        cursor = self.col.find(
            projection={"_id": False, "isolate_id": True, "row_ver": {"$ifNull": ["$row_ver", 0]}},
            batch_size=batch_size,
        )

        for batch in yield_chunks(cursor, batch_size):
            self.get_isolates_to_update(batch)

    def get_isolates_to_update(self, element_batch):
        with ApiClient(tbr_configuration) as api_client:
            api_instance = IsolateApi(api_client)
            try:
                print(element_batch)
                api_response = api_instance.api_isolate_post(row_version=element_batch)
                logging.info(api_response)
            except Exception as e:
                logging.error(
                    f"Exception on check for isolate updates IsolateApi->api_isolate_post: {e}\n"
                )

def yield_chunks(cursor, chunk_size):
    """
    Generator to yield chunks from cursor
    :param cursor:
    :param chunk_size:
    """
    chunk = []
    for i, row in enumerate(cursor):
        if i % chunk_size == 0 and i > 0:
            yield chunk
            del chunk[:]
        chunk.append(row)
    yield chunk