import logging
import pymongo
import time
from brokers.shared import  yield_chunks
from brokers.lims_conn import *
from common.database import (
    coerce_dates,
    encrypt_dict,
    get_connection,
)
from common.config.column_config import pii_columns

# LIMS API imports
import api_clients.lims_client
from api_clients.lims_client.api import isolate_api
from api_clients.lims_client.models import (
    IsolateGetRequest,
)

class LIMSPullingBrokerSync():
    def __init__(
        self, lims_col_name, analysis_view_col_name, db
    ):
        super(LIMSPullingBrokerSync, self).__init__()
        self.db = db
        self.analysis_col = db[analysis_view_col_name]
        self.metadata_col = db[lims_col_name]
        self.broker_name = "LIMS Pulling broker"
        _, enc = get_connection(with_enc=True)
        self.encryption_client = enc

    def run(self):
        logging.info(f"Started {self.broker_name} thread.")
        interval = 60 * 10  # 10 minutes
        while True:
            self.run_sync_job()
            time.sleep(interval)

    def run_sync_job(self):
        batch_size = 200
        fetch_pipeline = [
            {"$match": {"institution": "FVST"}},
            {
                "$group": {
                    "_id": "$_id",
                    "isolate_id": {"$first": "$isolate_id"},
                    "institution": {"$first": "$institution"},
                }
            },
            {
                "$lookup": {
                    "from": "sap_lims_metadata",
                    "localField": "isolate_id",
                    "foreignField": "isolate_id",
                    "as": "metadata",
                }
            },
            {
                "$match": {
                    "$or": [
                        {"metadata.gdpr_deleted": {"$exists": False}},
                        {"metadata.gdpr_deleted": False},
                    ],
                    "metadata": [],
                }
            },
            {"$project": {"_id": False, "isolate_id": "$isolate_id"}},
        ]

        cursor = self.analysis_col.aggregate(
            fetch_pipeline,
            batchSize=batch_size,
        )

        update_count = 0

        conn_id, lms_cfg = create_lims_conn_config()

        with api_clients.lims_client.ApiClient(lms_cfg) as api_client:
            for batch in yield_chunks(cursor, batch_size):
                update_count += self.update_isolate_metadata(api_client, batch)

        close_lims_connection(conn_id, lms_cfg)

        logging.info(f"Added/Updated {update_count} isolates with data from LIMS.")

    def update_isolate_metadata(self, api_client, element_batch):
        api_instance = isolate_api.IsolateApi(api_client)
        transformed_batch = []
        for element in element_batch:
            isolate_get_req = IsolateGetRequest(isolate_id=element["isolate_id"])

            api_response = api_instance.post_actions_get_isolate(
                isolate_get_request=isolate_get_req
            )
            if (
                "output" in api_response
                and "sapresponse" in api_response.output
                and (("success" in api_response.output.sapresponse 
                      and api_response.output.sapresponse.success) 
                     or ("succcess" in api_response.output.sapresponse 
                         and api_response.output.sapresponse.succcess)) # sic - see lims.v1.yaml
            ):
                transformed_batch.append(transform_lims_metadata(api_response))
            else:
                logging.debug(f"Skipping isolate: {element['isolate_id']} -- sapresponse unsuccessful")

        bulk_update_queries = self.upsert_lims_metadata_batch(transformed_batch)
        update_count = 0
        if len(bulk_update_queries) > 0:
            bulk_result = self.metadata_col.bulk_write(
                bulk_update_queries, ordered=False
            )
            update_count = bulk_result.upserted_count + bulk_result.modified_count

        return update_count

    def upsert_lims_metadata_batch(self, metadata_batch):
        result = []
        for values in metadata_batch:
            isolate_id = values["isolate_id"]
            coerce_dates(values, dayfirst=True)
            encrypt_dict(self.encryption_client, values, pii_columns())

            update_query = pymongo.UpdateOne(
                {"isolate_id": isolate_id}, {"$set": values}, upsert=True
            )
            result.append(update_query)

        return result
