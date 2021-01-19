#import .database
import pymongo
import logging
import json
from web.src.SAP.generated.models import AnalysisResult
import sys

hostname = "bifrost_db"
rset = "rs0"
dbname = "bifrost_test"
collection = "sap_full_analysis"
    
def remove_id(item):
    item.pop('_id', None)
    return item

def get_analysis_page(query, page_size, offset):
    conn = pymongo.MongoClient(hostname, replicaset=rset)
    mydb = conn[dbname]
    samples = mydb[collection]

    return list(map(remove_id, samples.find(query).sort('run_date',pymongo.DESCENDING).skip(offset).limit(int(page_size) + 2)))

def get_analysis_count(query):
    conn = pymongo.MongoClient(hostname, replicaset=rset)
    mydb = conn[dbname]
    samples = mydb[collection]

    return samples.find(query).count()

def update_analysis(change):
    conn = pymongo.MongoClient(hostname, replicaset=rset)
    mydb = conn[dbname]
    samples = mydb[collection]
    updates = map(lambda x: {**change[x], 'id':x}, change.keys())
    for u in updates:
        samples.update_one({'isolate_id': u['id'] }, {'$set': u})

def get_single_analysis(identifier):
    conn = pymongo.MongoClient(hostname, replicaset=rset)
    mydb = conn[dbname]
    samples = mydb[collection]
    return samples.find_one({'isolate_id': identifier})

