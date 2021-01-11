import pymongo
import logging
import json
from web.src.SAP.generated.models import Approval
import sys

hostname = "bifrost_db"
rset = "rs0"
dbname = "bifrost_test"
collection = "sap_approvals"
    
def remove_id(item):
    item.pop('_id', None)
    return item

def find_approvals(user: str):
    conn = pymongo.MongoClient(hostname, replicaset=rset)
    mydb = conn[dbname]
    approvals = mydb[collection]

    return list(map(remove_id, approvals.find({'approver': user}).sort('timestamp', pymongo.DESCENDING)))

def insert_approval(approval: Approval):
    conn = pymongo.MongoClient(hostname, replicaset=rset)
    mydb = conn[dbname]
    approvals = mydb[collection]

    return approvals.insert_one(approval.to_dict())

def revoke_approval(username: str, approval_id: str):
    conn = pymongo.MongoClient(hostname, replicaset=rset)
    mydb = conn[dbname]
    approvals = mydb[collection]

    return approvals.update_one({'id': approval_id, 'approver': username}, {'$set': {'status': 'cancelled' }})

def find_all_active_approvals():
    conn = pymongo.MongoClient(hostname, replicaset=rset)
    mydb = conn[dbname]
    approvals = mydb[collection]

    return list(map(remove_id, approvals.find({'status': 'submitted'})))

