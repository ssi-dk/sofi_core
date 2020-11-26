#import .database
import pymongo
import json
from web.src.SAP.generated.models import Analysis
import sys
    

def get_all_analysis():
    conn = pymongo.MongoClient()
    mydb = conn["bifrost_test"]
    samples = mydb["sap_analysis_results"]

    return list(map(sample_to_model, samples.find().limit(10)))
