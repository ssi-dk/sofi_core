import sys, os
import logging
import pymongo
import subprocess
import time
from bson.objectid import ObjectId
from aggregation import agg_pipeline, create_userchanged_migration_pipeline

LOGLEVEL = os.environ.get("LOG_LEVEL", "INFO").upper()

logging.basicConfig(
    format="%(name)s - %(levelname)s - %(message)s",
    stream=sys.stdout,
    level=LOGLEVEL,
)

logging.info("bifrost_listener starting up")

max_duration = float(os.environ.get("VIEW_REFRESH_MAX_DURATION", "5"))
client = pymongo.MongoClient(os.environ.get("BIFROST_CONN"))
db = client.get_database()

pipeline = [
    {
        "$match": {
            "operationType": {"$in": ["replace", "update", "insert"]},
            # "fullDocument.status": "Success",
        }
    }
]
options = {}

resume_token = None
timer = time.process_time()


def elapsed_seconds(duration: float):
    return (time.process_time() - duration) * 1000


def watch_loop():
    global resume_token
    global timer

    with db.samples.watch(pipeline, **options) as stream:
        has_change = False
        changed_ids = []
        while stream.alive:
            change = stream.try_next()
            # Note that the ChangeStream's resume token may be updated
            # even when no changes are returned.
            resume_token = stream.resume_token

            if change is not None:
                if has_change == False:
                    timer = time.process_time()
                    has_change = True
                doc_id = change["documentKey"]["_id"]
                changed_ids.append(ObjectId(doc_id))

            if has_change and elapsed_seconds(timer) > max_duration:
                logging.info(f"Running aggregation on {len(changed_ids)} samples, ids: {changed_ids}")
                startTime = time.process_time()
                db.samples.aggregate(agg_pipeline(changed_ids))
                timer = time.process_time()
                logging.info(f"Aggregation complete {len(changed_ids)} samples, in {elapsed_seconds(timer - startTime)} ms")
                changed_ids = []
                has_change = False


logging.info("bifrost_listener initialized")

logging.info("Running update non tracked userchanged fields ...")
timer = time.process_time()
print(db.samples.aggregate(create_userchanged_migration_pipeline()))
logging.info(f"Finished update non tracked userchanged fields {elapsed_seconds(time.process_time()-timer)} ms")

logging.info("Running first aggregation ...")
timer = time.process_time()
db.samples.aggregate(agg_pipeline())
logging.info(f"Finished first aggregation in {elapsed_seconds(time.process_time()-timer)} ms")

while True:
    try:
        watch_loop()
    except pymongo.errors.PyMongoError as e:
        print(e)
        if resume_token is None:
            logging.error("Resume token error. Listener is stopping...")

# """
