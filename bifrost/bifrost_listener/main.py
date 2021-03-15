import sys, os
import logging
import pymongo
import subprocess
from aggregation import agg_pipeline

logging.basicConfig(
    format="%(name)s - %(levelname)s - %(message)s",
    stream=sys.stdout,
    level=logging.DEBUG,
)

logging.info("bifrost_listener starting up")

client = pymongo.MongoClient(os.environ.get("BIFROST_CONN"))
db = client.get_database()

pipeline = [
    {
        "$match": {
            "operationType": {"$in": ["replace", "update"]},
            # "fullDocument.status": "Success",
        }
    }
]
options = {"full_document": "updateLookup"}

resume_token = None


def watch_loop():
    global resume_token
    with db.samples.watch(pipeline, **options) as stream:
        for insert_change in stream:
            # logging.info(insert_change)
            logging.info("Detected change, running aggregation..")
            db.samples.aggregate(agg_pipeline)
            resume_token = stream.resume_token


logging.info("bifrost_listener initialized")
logging.info("Running first aggregation")
db.samples.aggregate(agg_pipeline)
while True:
    try:
        watch_loop()
    except pymongo.errors.PyMongoError:
        if resume_token is None:
            logging.error("Resume token error. Listener is stopping...")

# """
