import os, sys
import logging
import time
import pymongo
import threading
from pymongo import CursorType
from ..shared import (
    BrokerError,
    yield_chunks,
    tbr_to_sofi_column_mapping as column_mapping,
)
from ..tbr_conn import get_tbr_configuration
from common.database import (
    coerce_dates,
    encrypt_dict,
    get_connection,
)
from common.config.column_config import pii_columns

# TBR API imports
import time
import api_clients.tbr_client
from pymongo.collection import ReturnDocument
from pprint import pprint
from api_clients.tbr_client.api.isolate_api import ApiClient, IsolateApi
from api_clients.tbr_client.models import Isolate, RowVersion


class TBRPullingBroker(threading.Thread):
    def __init__(
        self, data_lock, tbr_col_name, analysis_view_col_name, thread_timeout, db
    ):
        super(TBRPullingBroker, self).__init__()
        self.data_lock = data_lock
        self.db = db
        self.analysis_col = db[analysis_view_col_name]
        self.metadata_col = db[tbr_col_name]
        self.stop = threading.Event()
        self.thread_timeout = thread_timeout
        self.broker_name = "TBR Pulling broker"
        _, enc = get_connection(with_enc=True)
        self.encryption_client = enc

    def stop(self):
        self.stop.set()

    def run(self):
        logging.info(f"Started {self.broker_name} thread.")
        interval = 60 * 10  # 10 minutes
        first_run = True
        while first_run or not self.stop.wait(interval):
            first_run = False
            thread_acquired = self.data_lock.acquire(timeout=self.thread_timeout)
            if not thread_acquired:
                logging.warning(
                    f"{self.broker_name} Failed to acquire thread before {self.thread_timeout} seconds timeout"
                )
                continue
            try:
                self.run_sync_job()
            except:
                raise
            finally:
                self.data_lock.release()

    def run_sync_job(self):
        batch_size = 200
        fetch_pipeline = [
            {"$match": {"institution": "SSI"}},
            {
                "$group": {
                    "_id": "$_id",
                    "isolate_id": {"$first": "$isolate_id"},
                    "institution": {"$first": "$institution"},
                }
            },
            {
                "$lookup": {
                    "from": "sap_tbr_metadata",
                    "localField": "isolate_id",
                    "foreignField": "isolate_id",
                    "as": "metadata",
                }
            },
            # {"$unwind": {"path": "$metadata", "preserveNullAndEmptyArrays": True}},
            {
                "$match": {
                    "$and": [
                        {"isolate_id": {"$ne": null}},
                        {"$or": [                         
                            {"metadata.gdpr_deleted": {"$exists": False}},
                            {"metadata.gdpr_deleted": False},
                        ]}
                    ]
                }
            },
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

        logging.info(f"Added/Updated {update_count} isolates with data from TBR.")

    def update_isolate_metadata(self, element_batch):
        with ApiClient(get_tbr_configuration()) as api_client:
            api_instance = IsolateApi(api_client)
            update_count = 0
            try:
                row_ver_elems = [RowVersion(**element) for element in element_batch]
                
                logging.debug(f"Calling TBR with {row_ver_elems}")
                updated_isolates = api_instance.api_isolate_changed_isolates_post(
                    row_version=row_ver_elems
                )
                bulk_update_queries = self.upsert_tbr_metadata_batch(updated_isolates)

                if len(bulk_update_queries) > 0:
                    bulk_result = self.metadata_col.bulk_write(
                        bulk_update_queries, ordered=False
                    )
                    update_count = (
                        bulk_result.upserted_count
                        + bulk_result.modified_count
                        + bulk_result.inserted_count
                    )

            except Exception as e:
                logging.error(
                    f"Exception on check for isolate updates {self.broker_name}: {e}\n"
                )
            finally:
                return update_count

    def upsert_tbr_metadata_batch(self, updated_isolates):
        result = []
        for isolate in updated_isolates:
            values = isolate.to_dict()
            isolate_id = values["isolate_id"]
            values = {
                column_mapping[k]: v
                for k, v in values.items()
                if column_mapping.normal_get(k)
            }

            coerce_dates(values)
            encrypt_dict(self.encryption_client, values, pii_columns())

            update_query = pymongo.UpdateOne(
                {"isolate_id": isolate_id}, {"$set": values}, upsert=True
            )
            result.append(update_query)

        return result
