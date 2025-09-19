import logging
import pymongo
from pymongo.errors import BulkWriteError
from brokers.shared import (
    yield_chunks,
    tbr_to_sofi_column_mapping as column_mapping,
)
from brokers.tbr_conn import get_tbr_configuration
from common.database import (
    coerce_dates,
    encrypt_dict,
    get_connection,
)
from common.config.column_config import pii_columns

# TBR API imports
import time
from api_clients.tbr_client.api.isolate_api import ApiClient, IsolateApi
from api_clients.tbr_client.models import RowVersion


class TBRPullingBrokerSync():
    def __init__(
        self, tbr_col_name, analysis_view_col_name, db
    ):
        self.db = db
        self.analysis_col = db[analysis_view_col_name]
        self.metadata_col = db[tbr_col_name]
        self.broker_name = "TBR Pulling broker"
        _, enc = get_connection(with_enc=True)
        self.encryption_client = enc

    def run(self):
        logging.info(f"Started {self.broker_name} thread.")
        interval = 60 * 10  # 10 minutes
        while True:
            t0 = time.time()
            try:
                self.run_sync_job()
            except Exception:
                logging.exception("run_sync_job() crashed; continuing loop")
            sleep_for = max(0, interval - (time.time() - t0))
            time.sleep(sleep_for)

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
                        {"isolate_id": {"$ne": None}},
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
        row_ver_elems = [RowVersion(**element) for element in element_batch]
        try:
            with ApiClient(get_tbr_configuration()) as api_client:
                api_instance = IsolateApi(api_client)
                update_count = 0
                updated_isolates = api_instance.api_isolate_changed_isolates_post(
                    row_version=row_ver_elems,
                    _request_timeout=(10, 60),
                )
        except Exception:
            logging.exception("TBR call failed")
            return 0
        
        bulk_update_queries = self.upsert_tbr_metadata_batch(updated_isolates)
        if not bulk_update_queries:
            return 0

        try:
            bulk_result = self.metadata_col.bulk_write(
                bulk_update_queries, ordered=False
            )
        except BulkWriteError:
            logging.exception("Mongo bulk_write failed")
            return 0
        except Exception:
            logging.exception("Mongo write failed")
            return 0

        return (
            bulk_result.upserted_count
            + bulk_result.modified_count
            + bulk_result.inserted_count
        )

    def upsert_tbr_metadata_batch(self, updated_isolates):
        result = []
        for isolate in updated_isolates:
            try:
                values = isolate.to_dict()
                isolate_id = values["isolate_id"]
                values = {
                    column_mapping[k]: v
                    for k, v in values.items()
                    if column_mapping.normal_get(k)
                }

                #logging.debug(f"Updating isolate {isolate_id} with {values}")
                coerce_dates(values)
                #logging.debug(f"Updating isolate after date fixes {isolate_id} with {values}")
                encrypt_dict(self.encryption_client, values, pii_columns())
                #logging.debug(f"Updating isolate after encryption {isolate_id} with {values}")
                update_query = pymongo.UpdateOne(
                    {"isolate_id": isolate_id}, {"$set": values}, upsert=True
                )
                result.append(update_query)
            except Exception:
                logging.exception("Failed to upsert isolate %r; skipping", values.get("isolate_id"))
                continue
        return result
