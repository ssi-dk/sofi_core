import pymongo
from pymongo import CursorType
import threading

class TBRBroker(threading.Thread):

    def __init__(self, num, db_name, collection_name):
        super(TBRBroker, self).__init__()
        self.conn = pymongo.MongoClient()
        self.db = self.conn[db_name]
        self.col = self.db[collection_name]
        self._stop = threading.Event()
        self.num = num

    def stop(self):
        self._stop.set()

    def run(self):
        cursor = self.col.find({'status': 'waiting'}, cursor_type=CursorType.TAILABLE_AWAIT)
        while not self._stop.isSet():
            try:
                record = cursor.next()
                logging.info(f'Thread {self.num} trying to DB lock {record['_id']}...')
                try:
                    self.col.update({'_id': record['_id'], 'status': 'waiting'},
                                  {'$set': {'status': 'processing'}})
                except OperationFailure:
                    # Update failed.
                    logging.error(f'DB level lock failed for thread {self.num} continuing...')
                    continue
                self.handle_request(record)
                record['status'] = 'done'
                self.col.save(record)
                # or delete
            except StopIteration:
                logging.error(f'Thread {self.num} received StopIteration exception, restarting loop...')
            else:
                pass

    def handle_request(self, req):
        logging.info(req)