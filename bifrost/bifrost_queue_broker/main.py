import sys, os
import logging

# import pymongo
from common.database import get_connection, encrypt_dict, DB_NAME

import threading
from functools import partial
from brokers.request.tbr_request_broker import TBRRequestBroker
from brokers.pulling.tbr_pulling_broker import TBRPullingBroker

from brokers.request.lims_request_broker import LIMSRequestBroker
from brokers.pulling.lims_pulling_broker import LIMSPullingBroker


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
    TBR_COLLECTION_NAME = os.environ.get(
        "BIFROST_MONGO_TBR_METADATA_COLLECTION", "sap_tbr_metadata"
    )
    LIMS_COLLECTION_NAME = os.environ.get(
        "BIFROST_MONGO_LIMS_METADATA_COLLECTION", "sap_lims_metadata"
    )
    ANALYSIS_COLLECTION_NAME = os.environ.get(
        "BIFROST_MONGO_ANALYSIS_VIEW_COLLECTION", "sap_analysis_results"
    )
    QUEUE_COLLECTION_NAME = os.environ.get("BIFROST_MONGO_QUEUE_COLLECTION", "sap_broker_queue")

    conn, enc = get_connection(with_enc=True)
    db = conn[DB_NAME]
    create_collections_if_not_exist(
        db,
        QUEUE_COLLECTION_NAME,
        [TBR_COLLECTION_NAME, LIMS_COLLECTION_NAME, ANALYSIS_COLLECTION_NAME],
    )
    logging.info(f"Broker queue listener starting up.")

    TBR_data_lock = threading.Lock()
    LIMS_data_lock = threading.Lock()

    # Some of the brokers take different arguments other than the db and collection. Partially apply these.
    tbr_requests = partial(
        TBRRequestBroker, TBR_data_lock, QUEUE_COLLECTION_NAME, TBR_COLLECTION_NAME
    )
    tbr_puller = partial(
        TBRPullingBroker, TBR_data_lock, TBR_COLLECTION_NAME, ANALYSIS_COLLECTION_NAME
    )

    lims_requests = partial(
        LIMSRequestBroker, LIMS_data_lock, QUEUE_COLLECTION_NAME, LIMS_COLLECTION_NAME
    )
    lims_puller = partial(
        LIMSPullingBroker,
        LIMS_data_lock,
        LIMS_COLLECTION_NAME,
        ANALYSIS_COLLECTION_NAME,
    )

    # Which brokers to start up as seperate threads.
    brokers = [tbr_requests, tbr_puller, lims_requests, lims_puller]

    threads = []
    for broker in brokers:
        t = broker(db)
        t.setDaemon(True)
        threads.append(t)

    for t in threads:
        t.start()

    for t in threads:
        t.join()

    logging.info("All threads exited.")


if __name__ == "__main__":
    LOGLEVEL = os.environ.get("LOGLEVEL", "DEBUG").upper()
    logging.basicConfig(
        format="%(name)s - %(levelname)s - %(message)s",
        stream=sys.stdout,
        level=LOGLEVEL,
    )
    main()
