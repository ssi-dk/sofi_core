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
    def __init__(self, data_lock, tbr_col_name, analysis_view_col_name, db):
        super(TBRPullingBroker, self).__init__()
        self.data_lock = data_lock
        self.db = db
        self.analysis_col = db[analysis_view_col_name]
        self.metadata_col = db[tbr_col_name]
        self.stop = threading.Event()
        self.broker_name = "TBR Pulling broker"

    def stop(self):
        self.stop.set()

    def run(self):
        logging.info(f"Started {self.broker_name} thread.")
        interval = 60 * 10  # 10 minutes
        first_run = True
        while first_run or not self.stop.wait(interval):
            first_run = False
            self.data_lock.acquire()
            try:
                self.run_sync_job()
            except:
                raise
            finally:
                self.data_lock.release()

    def run_sync_job(self):
        batch_size = 200
        fetch_pipeline = [
            {"$group": {"_id": "$_id", "isolate_id": {"$first": "$isolate_id"}}},
            {
                "$lookup": {
                    "from": "sap_tbr_metadata",
                    "localField": "isolate_id",
                    "foreignField": "isolate_id",
                    "as": "metadata",
                }
            },
            {"$unwind": {"path": "$metadata"}},
            {
                "$project": {
                    "_id": False,
                    "isolate_id": "$metadata.isolate_id",
                    "row_ver": {"$ifNull": ["$metadata.row_ver", 0]},
                }
            },
        ]

        cursor = self.analysis_col.aggregate(
            fetch_pipeline,
            batchSize=batch_size,
        )

        update_count = 0

        for batch in yield_chunks(cursor, batch_size):
            update_count += self.update_isolate_metadata(batch)

        logging.info(f"Updated {update_count} isolates with data from TBR.")

    def update_isolate_metadata(self, element_batch):
        with ApiClient(tbr_configuration) as api_client:
            api_instance = IsolateApi(api_client)
            try:
                row_ver_elems = [RowVersion(**element) for element in element_batch]

                updated_isolates = api_instance.api_isolate_changed_isolates_post(
                    row_version=row_ver_elems
                )
                bulk_update_queries = add_mongo_document_id(updated_isolates)

                update_count = 0
                if len(bulk_update_queries) > 0:
                    bulk_result = self.metadata_col.bulk_write(
                        bulk_update_queries, ordered=False
                    )
                    update_count = bulk_result.modified_count

                return update_count

            except Exception as e:
                logging.error(
                    f"Exception on check for isolate updates IsolateApi->api_isolate_changed_isolates_post: {e}\n"
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


def add_mongo_document_id(updated_isolates):
    result = []
    # And find the equivalent document id for each isolate
    for isolate in updated_isolates:
        values = isolate.to_dict()
        update_query = pymongo.UpdateOne(
            {"isolate_id": values["isolate_id"]}, {"$set": values}, upsert=True
        )
        result.append(update_query)

    return result