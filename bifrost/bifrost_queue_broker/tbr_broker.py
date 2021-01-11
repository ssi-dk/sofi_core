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
                try:
                    self.col.update({'_id': record['_id'], 'status': 'waiting'},
                                  {'$set': {'status': 'processing'}})
                except OperationFailure:
                    # Update failed.
                    continue
                self.handle_request(record)
                record['status'] = 'done'
                self.col.save(record)
                # or delete
            except StopIteration:
                print(self.num, 'waiting')
            else:
                print(self.num, 'sub', record)

    def handle_request(self, req):
        print(req)