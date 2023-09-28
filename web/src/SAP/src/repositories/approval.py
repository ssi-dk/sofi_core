import pymongo
import logging
import json
from web.src.SAP.generated.models import Approval
from web.src.SAP.generated.models.approval_status import ApprovalStatus
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


def find_approvals_by_sequence_id(sequence_id: str):
    conn = get_connection()
    mydb = conn[DB_NAME]
    approvals = mydb[APPROVALS_COL_NAME]

    return list(
        map(
            remove_id,
            approvals.find({f"matrix.{sequence_id}": {"$exists": 1}}).sort(
                "timestamp", pymongo.ASCENDING
            ),
        )
    )


def check_active_approval(approval: Approval):
    return approval["status"] == "submitted"


def get_approval_matrix(sequence_id: str):
    approvals = find_approvals_by_sequence_id(sequence_id)
    if len(approvals) == 0 or not approvals:
        return {}
    matrices = list(
        map(lambda x: x["matrix"], filter(check_active_approval, approvals))
    )
    if len(matrices) == 0 or not matrices:
        return {}
    return {k: v for d in matrices for k, v in d.items()}[sequence_id]


def insert_approval(username: str, approval: Approval):
    conn = get_connection()
    mydb = conn[DB_NAME]
    approvals = mydb[APPROVALS_COL_NAME]
    appr = approval.to_dict()
    appr["approver"] = username
    seqs = list(approval.matrix.keys())
    appr["sequence_ids"] = list(approval.matrix.keys())

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
