import pymongo
import threading
from tbr_broker import TBRBroker

"""
class Publisher(object):

    def __init__(self):
        super(Publisher, self).__init__()
        self.conn = pymongo.MongoClient()
        self.db = self.conn[DB_NAME]
        self.col = self.db[COLLECTION_NAME]

    def insert(self, data):
        print self.col.insert({
            'item': data,
        })
"""

def main():
    conn = pymongo.MongoClient()
    db = conn[DB_NAME]
    db.drop_collection(COLLECTION_NAME)
    db.create_collection(COLLECTION_NAME, capped=True, size=256000000, max=50000)

    threads = []
    for i in xrange(1):
        t = TBRBroker(i)
        threads.append(t)
    for t in threads:
        t.start()
#    for t in threads:
#        t.stop()
    for t in threads:
        t.join()


if __name__ == '__main__':
    main()
