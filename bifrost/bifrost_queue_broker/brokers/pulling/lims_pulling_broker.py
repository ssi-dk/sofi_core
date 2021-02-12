import os, sys
import logging
import time
import pymongo
import threading
from pymongo import CursorType
from ..shared import BrokerError
from common.database import encrypt_dict, get_connection

# LIMS API imports
import time
import api_clients.lims_client
from api_clients.lims_client.api import connections_api, isolate_api
from api_clients.lims_client.models import (
    IsolateGetRequest,
    IsolateGetResponse,
    ConnectionCreateRequest,
    ConnectionCreateResponse,
)


# from api_clients.lims_client.model.


lims_api_url = os.environ.get("LIMS_API_URL", "http://localhost:4021")
lims_api_databaseid = os.environ.get("LIMS_API_DATABASEID")
lims_api_username = os.environ.get("LIMS_API_USERNAME")
lims_api_password = os.environ.get("LIMS_API_PASSWORD")

lims_configuration = api_clients.lims_client.Configuration(host=lims_api_url)


class LIMSPullingBroker(threading.Thread):
    def __init__(self, data_lock, lims_col_name, analysis_view_col_name, db):
        super(LIMSPullingBroker, self).__init__()
        self.data_lock = data_lock
        self.db = db
        self.analysis_col = db[analysis_view_col_name]
        self.metadata_col = db[lims_col_name]
        self.stop = threading.Event()
        self.broker_name = "LIMS Pulling broker"
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
            {
                "$group": {
                    "_id": "$_id",
                    "isolate_id": {"$first": "$isolate_id"},
                    "institution": {"$first": "$institution"},
                }
            },
            {"$match": {"institution": "FVST"}},
            {
                "$lookup": {
                    "from": "sap_lims_metadata",
                    "localField": "isolate_id",
                    "foreignField": "isolate_id",
                    "as": "metadata",
                }
            },
            {"$match": {"metadata": []}},
            {"$project": {"_id": False, "isolate_id": "$isolate_id"}},
        ]

        cursor = self.analysis_col.aggregate(
            fetch_pipeline,
            batchSize=batch_size,
        )

        update_count = 0

        with api_clients.lims_client.ApiClient(lims_configuration) as api_client:
            # Create an instance of the API class
            conn_create_instance = connections_api.ConnectionsApi(api_client)
            conn_req = ConnectionCreateRequest(
                databaseid=lims_api_databaseid,
                username=lims_api_username,
                password=lims_api_password,
            )
            connection_id = None
            try:
                api_response: ConnectionCreateResponse = conn_create_instance.post_connections(
                    connection_create_request=conn_req
                )
                connection_id = api_response.connections.connectionid
            except api_clients.lims_client.ApiException as e:
                print("Exception when creating connection: %s\n" % e)
        
        lms_cfg = api_clients.lims_client.Configuration(
            host=lims_api_url,
            api_key={'cookieAuth': f"connectionid={connection_id}"}
        )

        with api_clients.lims_client.ApiClient(lms_cfg) as api_client:
            for batch in yield_chunks(cursor, batch_size):
                update_count += self.update_isolate_metadata(api_client, batch)

            conn_delete_instance = connections_api.ConnectionsApi(api_client)
            try:
                conn_delete_instance.delete_connections(connection_id=connection_id)
            except api_clients.lims_client.ApiException as e:
                print("Exception when deleting connection: %s\n" % e)

        logging.info(f"Added/Updated {update_count} isolates with data from LIMS.")

    def update_isolate_metadata(self, api_client, element_batch):
        api_instance = isolate_api.IsolateApi(api_client)
        transformed_batch = []
        try:
            for element in element_batch:
                isolate_get_req = IsolateGetRequest(isolate_id=element["isolate_id"])

                api_response = api_instance.post_actions_get_isolate(
                    isolate_get_request=isolate_get_req
                )
                if "output" in api_response and "sapresponse" in api_response.output:
                    transformed_batch.append(self.transform_lims_metadata(api_response))
            
            bulk_update_queries = self.upsert_lims_metadata_batch(transformed_batch)
            update_count = 0
            if len(bulk_update_queries) > 0:
                bulk_result = self.metadata_col.bulk_write(
                    bulk_update_queries, ordered=False
                )
                update_count = (
                    bulk_result.upserted_count + bulk_result.modified_count
                )

            return update_count

        except Exception as e:
            print("Exception when updating metadata: %s\n" % e)

        return len(element_batch)

    def upsert_lims_metadata_batch(self, metadata_batch):
        result = []
        for values in metadata_batch:
            isolate_id = values["isolate_id"]
            encrypt_dict(self.encryption_client, values, ["CHR-nr.", "Aut. Nummer", "CVR nr."])

            update_query = pymongo.UpdateOne(
                {"isolate_id": isolate_id}, {"$set": values}, upsert=True
            )
            result.append(update_query)

        return result

    def transform_lims_metadata(self, lims_metadata: IsolateGetResponse):
        metadata = {md.meta_field_name.value:md.meta_field_value for md in lims_metadata.output.sapresponse.metadata}
        data = {d.field_name.value:d.field_value for d in lims_metadata.output.sapresponse.data}
        return {"isolate_id": lims_metadata.output.sapresponse.isolate_id,**metadata, **data}

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
