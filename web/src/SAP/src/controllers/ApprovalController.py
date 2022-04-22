from typing import Dict
from web.src.SAP.src.repositories.analysis import update_analysis
from web.src.SAP.generated.models import Approval, ApprovalRequest, ApprovalStatus
from ..repositories.approval import (
    find_approvals,
    get_approval_matrix,
    revoke_approval,
    insert_approval,
    find_all_active_approvals,
)
from flask.json import jsonify
from flask import abort
import json
import sys
import datetime
import uuid
import logging
from web.src.SAP.src.security.permission_check import assert_user_has
from ..services.queue_service import post_and_await_approval


APPROVABLE_CATEGORY_COUNT = 6


def get_approvals(user, token_info):
    return jsonify(find_approvals(token_info["email"]))


def create_approval(user, token_info, body: ApprovalRequest):
    assert_user_has("approve", token_info)
    appr = Approval()
    appr.matrix = body.matrix
    appr.approver = user
    appr.timestamp = datetime.datetime.now()
    appr.status = "submitted"
    appr.id = str(uuid.uuid4())

    # set approval dates on  approved sequences before sending them for
    # approval, so the timestamps can be transferred to upstream metadata
    # services, if needed.
    analysis_timestamp_updates = {}
    seq_update = {}
    for seq in body.matrix:
        fields = body.matrix[seq]
        # find dates that were already approved, for incremental approval case.
        existing_matrix = get_approval_matrix(seq)

        existing_matrix.update(fields)
        time_fields = find_approved_categories(existing_matrix)
        # if all categories
        if len(time_fields) == APPROVABLE_CATEGORY_COUNT:
            seq_update = {"date_analysis_sofi": appr.timestamp}
        for f in time_fields:
            seq_update[f] = appr.timestamp
        analysis_timestamp_updates[seq] = seq_update

    update_analysis(analysis_timestamp_updates)

    errors_tuple = handle_approvals(appr, token_info["institution"])
    errors = []
    analysis_timestamp_reverts = {}
    for (error_seq_id, error) in errors_tuple:
        del appr.matrix[error_seq_id]
        analysis_timestamp_reverts[error_seq_id] = {"date_analysis_sofi": None}
        errors.append(error)

    # If any sequences errored out on the metadata service, revert their
    # date_analysis_sofi timestamp
    update_analysis(analysis_timestamp_reverts)

    # Insert approval after matrix has been manipulated
    res = insert_approval(token_info["email"], appr)

    return (
        jsonify({"success": appr.to_dict(), "error": errors})
        if res != None
        else abort(400)
    )


def handle_approvals(approvals: Approval, institution: str):
    errors = []
    for sequence_id, field_mask in approvals.matrix.items():
        if error := post_and_await_approval(sequence_id, field_mask, institution):
            errors.append(error)

    return errors


def cancel_approval(user, token_info, approval_id: str):
    assert_user_has("approve", token_info)
    res = revoke_approval(token_info["email"], approval_id)
    return None if res.modified_count > 0 else abort(404)


def full_approval_matrix(user, token_info):
    approvals = find_all_active_approvals()
    matrix = {}
    for a in approvals:
        matrix.update(a["matrix"])
    return jsonify(matrix)


def find_approved_categories(fields: Dict[str, ApprovalStatus]):
    time_fields = []
    for f in fields:
        if fields[f] == "approved":
            if f == "st_final":
                time_fields.append("date_approved_st")
            if f == "qc_final":
                time_fields.append("date_approved_qc")
            if f == "serotype_final":
                time_fields.append("date_approved_serotype")
            if f == "toxins_final":
                time_fields.append("date_approved_toxin")
            if f == "cluster_id":
                time_fields.append("date_approved_cluster")
            if f == "amr_profile":
                time_fields.append("date_approved_amr")

    return time_fields
