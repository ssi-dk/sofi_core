import logging
import pymongo
import threading
from tbr_broker import TBRBroker

logging.basicConfig(format='%(name)s - %(levelname)s - %(message)s', stream=sys.stdout, level=logging.DEBUG)



""" Insert example
def insert(self, data):
    print self.col.insert({
        'item': data,
    })
"""

def main():
    NUM_THREADS = 1
    logging.info(f"Broker queue listener starting up {NUM_THREADS} threads")
    conn = pymongo.MongoClient()
    db = conn[DB_NAME]
    db.drop_collection(COLLECTION_NAME)
    db.create_collection(COLLECTION_NAME, capped=True, size=256000000, max=50000)

    threads = []
    for i in range(NUM_THREADS):
        t = TBRBroker(i)
        threads.append(t)
    for t in threads:
        t.start()
#    for t in threads:
#        t.stop()
    for t in threads:
        t.join()

    logging.info("All threads exited.")

if __name__ == '__main__':
    main()
