import sys, os
import logging

# import pymongo
from common.database import get_connection, DB_NAME

from lims_request_broker_sync import LIMSRequestBrokerSync


def create_collections_if_not_exist(db, queue_col_name, metadata_col_names):
    # db.drop_collection(collection_name)
    cols = db.list_collection_names()
    if queue_col_name not in cols:
        db.create_collection(queue_col_name, capped=True, size=256000000, max=50000)
        # Insert dummy item to prevent stalling in brokers.
        db[queue_col_name].insert_one({})

    for collection_name in set(metadata_col_names).difference(set(cols)):
        db.create_collection(collection_name)
        db[collection_name].create_index("isolate_id")


def main():
    LIMS_COLLECTION_NAME = os.environ.get(
        "BIFROST_MONGO_LIMS_METADATA_COLLECTION", "sap_lims_metadata"
    )
    ANALYSIS_COLLECTION_NAME = os.environ.get(
        "BIFROST_MONGO_ANALYSIS_VIEW_COLLECTION", "sap_analysis_results"
    )
    QUEUE_COLLECTION_NAME = os.environ.get(
        "BIFROST_MONGO_QUEUE_COLLECTION", "sap_broker_queue"
    )


    conn, enc = get_connection(with_enc=True)
    db = conn[DB_NAME]
    create_collections_if_not_exist(
        db,
        QUEUE_COLLECTION_NAME,
        [LIMS_COLLECTION_NAME, ANALYSIS_COLLECTION_NAME],
    )
    logging.info(f"Broker queue listener starting up.")

    # Some of the brokers take different arguments other than the db and collection. Partially apply these.
    lims_requests = LIMSRequestBrokerSync(
        QUEUE_COLLECTION_NAME,
        LIMS_COLLECTION_NAME,
        db)

    lims_requests.run();


if __name__ == "__main__":
    LOGLEVEL = os.environ.get("LOG_LEVEL", "INFO").upper()
    logging.basicConfig(
        format="%(name)s - %(levelname)s - %(message)s",
        stream=sys.stdout,
        level=LOGLEVEL,
    )
    main()
