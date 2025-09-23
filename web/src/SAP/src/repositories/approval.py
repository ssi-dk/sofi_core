from typing import List
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


def find_approvals(user: str, institution: str):
    conn = get_connection()
    mydb = conn[DB_NAME]
    approvals = mydb[APPROVALS_COL_NAME]

    return list(
        map(
            remove_id,
            approvals.find({"$or": [{"approver": user},{"institution": institution}]}).sort("timestamp", pymongo.DESCENDING),
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


def insert_approval(username: str,institution: str, approval: Approval):
    conn = get_connection()
    mydb = conn[DB_NAME]
    approvals = mydb[APPROVALS_COL_NAME]
    appr = approval.to_dict()
    appr["approver"] = username
    appr["institution"] = institution
    appr["sequence_ids"] = list(approval.matrix.keys())
    appr["revoked_sequence_ids"] = list([])

    return approvals.insert_one(appr)


def revoke_approval(institution: str, approval_id: str, sequences: List[str]):
    conn = get_connection()
    mydb = conn[DB_NAME]
    approvals = mydb[APPROVALS_COL_NAME]

    # If all the sequences in the approval get cancelled, then revoke the whole aprroval
    # Otherwise justt revoke the individual sequence


    current_approval: dict | None = approvals.find_one({"id": approval_id, "institution": institution}) # type: ignore
    if current_approval is None:
        return None

    if len(current_approval["sequence_ids"]) == len(sequences):
        # Revoke full approval
        return approvals.update_one(
            {"id": approval_id}, {"$set": {"status": "cancelled"}}
        )
    else:
        # partial revoke
        new_seq_arr = list(filter(lambda s_id: s_id not in sequences,current_approval["sequence_ids"]))
        new_matrix = current_approval["matrix"].copy()
        for seq in sequences:
            del new_matrix[seq]


        return approvals.update_one({"id": approval_id},{"$set": {
            "sequence_ids": new_seq_arr,
            "revoked_sequence_ids": current_approval["revoked_sequence_ids"] + sequences if "revoked_sequence_ids" in current_approval else sequences, # Allows for revocation of older approvals which were not created after partial revokation was implemented/merged
            "matrix": new_matrix
        }})



    


def find_all_active_approvals():
    conn = get_connection()
    mydb = conn[DB_NAME]
    approvals = mydb[APPROVALS_COL_NAME]

    return list(map(remove_id, approvals.find({"status": "submitted"})))
