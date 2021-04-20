import pymongo
import logging
import json
from web.src.SAP.generated.models import Approval
from ...common.database import get_connection, DB_NAME, APPROVALS_COL_NAME
import sys

hostname = "bifrost_db"
rset = "rs0"
dbname = "bifrost_test"
collection = "sap_approvals"


def remove_id(item):
    item.pop("_id", None)
    return item


def find_approvals(user: str):
    conn = get_connection()
    mydb = conn[DB_NAME]
    approvals = mydb[APPROVALS_COL_NAME]

    return list(
        map(
            remove_id,
            approvals.find({"approver": user}).sort("timestamp", pymongo.DESCENDING),
        )
    )


def insert_approval(username: str, approval: Approval):
    conn = get_connection()
    mydb = conn[DB_NAME]
    approvals = mydb[APPROVALS_COL_NAME]
    appr = approval.to_dict()
    appr["approver"] = username
    print(approval.matrix, file=sys.stderr)
    print(approval.matrix.keys(), file=sys.stderr)
    seqs = list(approval.matrix.keys())
    print(seqs, file=sys.stderr)
    appr["sequence_ids"] = list(approval.matrix.keys())
    print(appr, file=sys.stderr)

    return approvals.insert_one(appr)


def revoke_approval(username: str, approval_id: str):
    conn = get_connection()
    mydb = conn[DB_NAME]
    approvals = mydb[APPROVALS_COL_NAME]

    return approvals.update_one(
        {"id": approval_id, "approver": username}, {"$set": {"status": "cancelled"}}
    )


def find_all_active_approvals():
    conn = get_connection()
    mydb = conn[DB_NAME]
    approvals = mydb[APPROVALS_COL_NAME]

    return list(map(remove_id, approvals.find({"status": "submitted"})))
