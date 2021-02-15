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
import datetime
import uuid
import logging
from web.src.SAP.src.security.permission_check import assert_user_has


def get_approvals(user, token_info):
    return jsonify(find_approvals(user))


def create_approval(user, token_info, body: ApprovalRequest):
    assert_user_has("approve", token_info)
    appr = Approval()
    appr.matrix = body.matrix
    appr.approver = user
    appr.timestamp = datetime.datetime.now().isoformat()
    appr.status = "submitted"
    appr.id = str(uuid.uuid4())
    res = insert_approval(appr)
    # TODO: update LIMS/TBR
    return jsonify(appr.to_dict()) if res != None else abort(400)


def cancel_approval(user, token_info, approval_id: str):
    assert_user_has("approve", token_info)
    res = revoke_approval(user, approval_id)
    return None if res.modified_count > 0 else abort(404)


def full_approval_matrix(user, token_info):
    approvals = find_all_active_approvals()
    matrix = {}
    for a in approvals:
        matrix.update(a["matrix"])
    return jsonify(matrix)
