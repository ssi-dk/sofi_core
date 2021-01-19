import sys, os
import logging
import pymongo
import threading
from functools import partial
from brokers.tbr_request_broker import TBRRequestBroker
from brokers.tbr_pulling_broker import TBRPullingBroker
from brokers.lims_broker import LIMSBroker

def create_collection_if_not_exists(db, collection_name):
    # db.drop_collection(collection_name)
    cols = db.list_collection_names()
    if collection_name not in cols:
        db.create_collection(collection_name, capped=True, size=256000000, max=50000)
        # Insert dummy item to prevent stalling in brokers.
        db[collection_name].insert_one({})

    return db[collection_name]


def main():
    HOST = os.environ.get("MONGO_HOST", "bifrost_db")
    PORT = int(os.environ.get("MONGO_PORT", 27017))
    DB_NAME = os.environ.get("MONGO_DB", "bifrost_test")
    COLLECTION_NAME = os.environ.get("MONGO_QUEUE_COLLECTION", "sap_broker_queue")
    
    db = pymongo.MongoClient(HOST, PORT)[DB_NAME]
    collection = create_collection_if_not_exists(db, COLLECTION_NAME)
    logging.info(f"Broker queue listener starting up.")

    TBR_data_lock = threading.Lock()

    # What brokers to start up as seperate threads.
    brokers = [partial(TBRRequestBroker, TBR_data_lock), partial(TBRPullingBroker, TBR_data_lock), LIMSBroker]

    threads = []
    for broker in brokers:
        t = broker(db, collection)
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
