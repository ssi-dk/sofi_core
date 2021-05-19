from web.src.SAP.generated.models import Approval, ApprovalRequest, ApprovalStatus
from ..repositories.approval import (
    find_approvals,
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


def get_approvals(user, token_info):
    return jsonify(find_approvals(token_info["email"]))


def create_approval(user, token_info, body: ApprovalRequest):
    assert_user_has("approve", token_info)
    appr = Approval()
    appr.matrix = body.matrix
    appr.approver = user
    appr.timestamp = datetime.datetime.now().isoformat()
    appr.status = "submitted"
    appr.id = str(uuid.uuid4())
    errors_tuple = handle_approvals(appr, token_info["institution"])
    errors = []
    for (error_seq_id, error) in errors_tuple:
        del appr.matrix[error_seq_id]
        errors.append(error)

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
