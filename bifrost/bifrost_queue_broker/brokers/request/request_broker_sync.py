import logging
from pymongo import CursorType
from ..shared import ProcessingStatus


class RequestBrokerSync():
    def __init__(self, db, collection, name, matcher, callback):
        super(RequestBrokerSync, self).__init__()
        self.db = db
        self.col = collection
        self.broker_name = name
        self.listener_match = matcher
        self.request_callback = callback

    def run(self):
        logging.info(f"Started {self.broker_name} thread.")
        cursor = self.col.find(
            self.listener_match, cursor_type=CursorType.TAILABLE_AWAIT
        )
        while True:
                record = cursor.next()
                logging.info(f"{self.broker_name} trying to DB lock {record['_id']}")
                # We cannot change size of documents in capped collections
                # so the "locking" should be the same length in both get and update.
                self.col.update(
                    {
                        "_id": record["_id"],
                        "status": ProcessingStatus.WAITING.value,
                    },
                    {"$set": {"status": ProcessingStatus.PROCESSING.value}},
                )
                self.request_callback(record)
                self.mark_done(record)

    def mark_done(self, record):
        record["status"] = ProcessingStatus.DONE.value
        self.col.save(record)

    def mark_error(self, record):
        record["status"] = ProcessingStatus.ERROR.value
        self.col.save(record)
