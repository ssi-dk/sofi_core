import os, sys
import logging
import time
import pymongo
import threading
from pymongo import CursorType
from ..shared import BrokerError

# LIMS API imports
import time


# lims_api_url = os.environ.get("LIMS_API_URL", "http://localhost:5000")

# lims_configuration = api_clients.lims_client.Configuration(host=lims_api_url)


class LIMSPullingBroker(threading.Thread):
    def __init__(self, data_lock, lims_col_name, analysis_view_col_name, db):
        super(LIMSPullingBroker, self).__init__()
        self.data_lock = data_lock
        self.db = db
        self.analysis_col = db[analysis_view_col_name]
        self.metadata_col = db[lims_col_name]
        self.stop = threading.Event()
        self.broker_name = "LIMS Pulling broker"

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
                    "from": "sap_lims_metadata",
                    "localField": "isolate_id",
                    "foreignField": "isolate_id",
                    "as": "metadata",
                }
            },
            # {"$unwind": {"path": "$metadata", "preserveNullAndEmptyArrays": True}},
            {
                "$project": {
                    "_id": False,
                    "isolate_id": "$isolate_id",
                    "row_ver": {
                        "$ifNull": [{"$arrayElemAt": ["$metadata.row_ver", 0]}, 0]
                    },
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

        logging.info(f"Added/Updated {update_count} isolates with data from LIMS.")

    def update_isolate_metadata(self, element_batch):
        return len(element_batch)


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
