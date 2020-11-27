#import .database
import pymongo
import json
from web.src.SAP.generated.models import Analysis
import sys
    
def remove_id(item):
    item.pop('_id', None)
    return item

def get_all_analysis():
    conn = pymongo.MongoClient("bifrost_db", replicaset='rs0')
    mydb = conn["bifrost_test"]
    samples = mydb["sap_analysis_results"]

    return list(map(remove_id, samples.find().limit(10)))
