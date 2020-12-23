#import .database
import pymongo
import json
from web.src.SAP.generated.models import UserDefinedView

def trim(item):
    item.pop('_id', None)
    item.pop('username', None)
    return item
    
def get_views(user: str):
    conn = pymongo.MongoClient("bifrost_db", replicaset='rs0')
    db = conn["sap_test"]
    views = db["user_views"]
    return list(map(trim, views.find({"username": user})))

def create_view(user: str, user_defined_view: UserDefinedView):
    conn = pymongo.MongoClient("bifrost_db", replicaset='rs0')
    db = conn["sap_test"]
    views = db["user_views"]
    record = {**user_defined_view.to_dict(), "username": user}
    return views.insert_one(record)

def remove_view(user: str, view_name: str):
    conn = pymongo.MongoClient("bifrost_db", replicaset='rs0')
    db = conn["sap_test"]
    views = db["user_views"]
    return views.delete_one({"username": user, "name": view_name})

