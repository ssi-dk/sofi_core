import sys
import logging
import time
import pymongo
from queue_status import ProcessingStatus 
from pymongo import CursorType
import threading


class Broker(threading.Thread):
    def __init__(self, db_name, collection_name, identifier, matcher, callback):
        super(Broker, self).__init__()
        self.conn = pymongo.MongoClient()
        self.db = self.conn[db_name]
        self.col = self.db[collection_name]
        self._stop = threading.Event()
        self.broker_identifier = identifier
        self.listener_match = matcher
        self.request_callback = callback

    def stop(self):
        self._stop.set()

    def run(self):
        logging.info(f"Started {self.broker_identifier} thread.")
        cursor = self.col.find(self.listener_match, cursor_type=CursorType.TAILABLE_AWAIT)
        while not self._stop.isSet():
            try:
                record = cursor.next()
                logging.info(f"{self.broker_identifier} trying to DB lock {record['_id']}")
                try:
                    # We cannot change size of documents in capped collections
                    # so the "locking" should be the same length in both get and update.
                    self.col.update({'_id': record['_id'], 'status': ProcessingStatus.WAITING.value},
                                  {'$set': {'status': ProcessingStatus.PROCESSING.value}})
                except pymongo.errors.OperationFailure as e:
                    # Update failed.
                    logging.error(f"DB level lock failed for {self.broker_identifier}, {e}")
                    continue

                self.request_callback(record)
                record['status'] = ProcessingStatus.DONE.value
                self.col.save(record)
            except StopIteration:
                time.sleep(1)
            else:
                pass