import logging
import time
import pymongo
from pymongo import CursorType
from pymongo.errors import PyMongoError
from bson.objectid import ObjectId
from ..shared import ProcessingStatus


class RequestBrokerSync():
    def __init__(self, db, collection, name, matcher, callback):
        super(RequestBrokerSync, self).__init__()
        self.db = db
        self.col = collection
        self.broker_name = name
        self.listener_match = matcher
        self.request_callback = callback
        self.batch_collect_duration = 0.4  # Min seconds to wait before processing batch
        self.resume_token = None
        self.timer = time.monotonic()

    def elapsed_seconds(self, start: float) -> float:
        """Returns time since start in seconds"""
        return (time.monotonic() - start)

    def watch_loop(self):
        # Create change stream pipeline matching your listener pattern
        pipeline = [
            {
                "$match": {
                    "operationType": {"$in": ["insert", "update"]},
                    # Match documents that have our listener criteria
                    **{f"fullDocument.{k}": v for k, v in self.listener_match.items()}
                }
            }
        ]
        
        options = {
        }
        
        with self.col.watch(pipeline, **options) as stream:
            collecting_batch = False
            pending_records = []
            
            while stream.alive:
                change = stream.try_next()
                # Update resume token even when no changes are returned
                self.resume_token = stream.resume_token

                if change is not None:
                    doc_id = change["documentKey"]["_id"]
                    logging.debug(f"{self.broker_name} detected change for {doc_id}")
                    self._process_record(doc_id)

    def _process_record(self, record_id):
        """Process a record ID"""
        if not record_id:
            return
            
        logging.info(f"{self.broker_name} processing  {record_id}")
        start_time = time.monotonic()
        
        # Atomically lock and retrieve the record
        record = self.col.find_one_and_update(
            {
                "_id": record_id,
                **self.listener_match,
                "status": ProcessingStatus.WAITING.value,
            },
            {"$set": {"status": ProcessingStatus.PROCESSING.value}},
            return_document=True
        )
        
        if record is not None:
            logging.debug(f"{self.broker_name} successfully locked and processing {record['_id']}")
            try:
                self.request_callback(record)
                self.mark_done(record)
            except Exception as e:
                logging.error(f"{self.broker_name} error processing {record['_id']}: {e}")
                self.mark_error(record)
        else:
            logging.debug(f"{self.broker_name} could not lock {record_id}, already processed or doesn't match criteria")
        
        elapsed_ms = self.elapsed_seconds(start_time) * 1000
        logging.info(f"{self.broker_name} complete: processed {record_id} in {elapsed_ms} ms")


    def _process_batch(self, record_ids):
        """Process a batch of record IDs atomically"""
        if not record_ids:
            return
            
        logging.info(f"{self.broker_name} processing batch of {len(record_ids)} records: {record_ids}")
        start_time = time.monotonic()
        
        processed_count = 0
        for record_id in record_ids:
            # Atomically lock and retrieve the record
            record = self.col.find_one_and_update(
                {
                    "_id": record_id,
                    **self.listener_match,
                    "status": ProcessingStatus.WAITING.value,
                },
                {"$set": {"status": ProcessingStatus.PROCESSING.value}},
                return_document=True
            )
            
            if record is not None:
                logging.debug(f"{self.broker_name} successfully locked and processing {record['_id']}")
                try:
                    self.request_callback(record)
                    self.mark_done(record)
                    processed_count += 1
                except Exception as e:
                    logging.error(f"{self.broker_name} error processing {record['_id']}: {e}")
                    self.mark_error(record)
            else:
                logging.debug(f"{self.broker_name} could not lock {record_id}, already processed or doesn't match criteria")
        
        elapsed_ms = self.elapsed_seconds(start_time) * 1000
        logging.info(f"{self.broker_name} batch complete: processed {processed_count}/{len(record_ids)} records in {elapsed_ms} ms")

    def run(self):
        logging.info(f"Started {self.broker_name} thread.")
        
        while True:
            try:
                logging.info(f"{self.broker_name} starting change stream monitoring.")
                self.watch_loop()
            except PyMongoError as e:
                logging.error(f"{self.broker_name} MongoDB error: {e}")
                if self.resume_token is None:
                    logging.error(f"{self.broker_name} Resume token error. Restarting without resume token...")
                # Continue the loop to restart the change stream
            except Exception as e:
                logging.error(f"{self.broker_name} unexpected error: {e}")
                # Continue the loop to restart

    def mark_done(self, record):
        record["status"] = ProcessingStatus.DONE.value
        self.col.save(record)

    def mark_error(self, record):
        record["status"] = ProcessingStatus.ERROR.value
        self.col.save(record)