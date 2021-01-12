import sys, os
import logging
import pymongo
import threading
from brokers.tbr_broker import TBRBroker
from brokers.lims_broker import LIMSBroker

LOGLEVEL = os.environ.get("LOGLEVEL", "DEBUG").upper()

logging.basicConfig(
    format="%(name)s - %(levelname)s - %(message)s", stream=sys.stdout, level=LOGLEVEL
)


def create_collection_if_not_exists(db_name, collection_name):
    conn = pymongo.MongoClient()
    db = conn[db_name]
    # db.drop_collection(collection_name)
    cols = db.list_collection_names()
    if collection_name not in cols:
        db.create_collection(collection_name, capped=True, size=256000000, max=50000)
        # Insert dummy item to prevent stalling in brokers.
        db[collection_name].insert({})


def main():
    DB_NAME = "bifrost_test"
    COLLECTION_NAME = "queue"
    create_collection_if_not_exists(DB_NAME, COLLECTION_NAME)
    logging.info(f"Broker queue listener starting up.")

    # What brokers to start up as seperate threads.
    brokers = [TBRBroker, LIMSBroker]

    threads = []
    for broker in brokers:
        t = broker(DB_NAME, COLLECTION_NAME)
        t.setDaemon(True)
        threads.append(t)

    for t in threads:
        t.start()

    for t in threads:
        t.join()

    logging.info("All threads exited.")


if __name__ == "__main__":
    main()
