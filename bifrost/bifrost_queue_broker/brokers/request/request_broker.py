import sys
import logging
import time
import pymongo
import threading
from pymongo import CursorType
from ..shared import ProcessingStatus, BrokerError


class RequestBroker(threading.Thread):
    def __init__(self, db, collection, name, matcher, callback):
        super(RequestBroker, self).__init__()
        self.db = db
        self.col = collection
        self._stop = threading.Event()
        self.broker_name = name
        self.listener_match = matcher
        self.request_callback = callback

    def stop(self):
        self._stop.set()

    def run(self):
        logging.info(f"Started {self.broker_name} thread.")
        cursor = self.col.find(
            self.listener_match, cursor_type=CursorType.TAILABLE_AWAIT
        )
        while not self._stop.isSet():
            try:
                record = cursor.next()
                logging.info(f"{self.broker_name} trying to DB lock {record['_id']}")
                try:
                    # We cannot change size of documents in capped collections
                    # so the "locking" should be the same length in both get and update.
                    self.col.update(
                        {
                            "_id": record["_id"],
                            "status": ProcessingStatus.WAITING.value,
                        },
                        {"$set": {"status": ProcessingStatus.PROCESSING.value}},
                    )
                except pymongo.errors.OperationFailure as e:
                    # Update failed.
                    logging.error(f"DB level lock failed for {self.broker_name}, {e}")
                    continue
                try:
                    self.request_callback(record)
                    self.mark_done(record)
                except BrokerError:
                    logging.error(f"Failure for record {record}")
                    self.mark_error(record)

            except StopIteration:
                time.sleep(1)
                if not cursor.alive:
                    log.error(f"{self.broker_name} stop iterations was thrown and curser is not alive.")
                    cursor = self.col.find(
                        self.listener_match, cursor_type=CursorType.TAILABLE_AWAIT
                    )
            else:
                pass

    def mark_done(self, record):
        record["status"] = ProcessingStatus.DONE.value
        self.col.save(record)

    def mark_error(self, record):
        record["status"] = ProcessingStatus.ERROR.value
        self.col.save(record)
