#import .database
import pymongo
import logging
import json
from web.src.SAP.generated.models import AnalysisResult
import sys
    
def remove_id(item):
    item.pop('_id', None)
    return item

def get_analysis_page(query, page_size, offset):
    conn = pymongo.MongoClient("bifrost_db", replicaset='rs0')
    mydb = conn["bifrost_test"]
    samples = mydb["sap_full_analysis"]

    return list(map(remove_id, samples.find(query).sort('run_date',pymongo.DESCENDING).skip(offset).limit(int(page_size) + 2)))

def get_analysis_count(query):
    conn = pymongo.MongoClient("bifrost_db", replicaset='rs0')
    mydb = conn["bifrost_test"]
    samples = mydb["sap_full_analysis"]

    return samples.find(query).count()
