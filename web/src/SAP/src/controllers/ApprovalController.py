from typing import Dict
from web.src.SAP.src.repositories.analysis import (get_single_analysis, update_analysis)
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
import os
from web.src.SAP.src.security.permission_check import (assert_user_has, assert_authorized_to_edit)
from ..services.queue_service import await_approval, post_approval


def deep_merge(source, destination):
    for key, value in source.items():
        if isinstance(value, dict):
            node = destination.setdefault(key, {})
            deep_merge(value, node)
        else:
            destination[key] = value
    return destination


def get_approvals(user, token_info):
    return jsonify(find_approvals(token_info["email"],token_info["institution"]))


def create_approval(user, token_info, body: ApprovalRequest):
    assert_user_has("approve", token_info)
    for sid in body.matrix.keys():
        s = get_single_analysis(sid)
        if s == None:
            abort(404, description=f"Analysis '{sid}' not found.")
        assert_authorized_to_edit(token_info, s)


    appr = Approval()
    appr.matrix = body.matrix
    appr.required_values = body.required_values
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
        time_fields = find_approved_categories(body.matrix[seq])
        
        for f in time_fields:
            seq_update[f] = appr.timestamp
            appr.matrix[seq][f] = ApprovalStatus.APPROVED
        analysis_timestamp_updates[seq] = seq_update

    update_analysis(analysis_timestamp_updates)

    errors_tuple = handle_approvals(appr, token_info["institution"])
    errors = []
    analysis_timestamp_reverts = {}
    for error_seq_id, error in errors_tuple:
        time_fields = find_approved_categories(appr.matrix[error_seq_id])
        for f in time_fields:
            analysis_timestamp_reverts[error_seq_id] = {f: None}
        del appr.matrix[error_seq_id]
        del appr.required_values[error_seq_id]
        errors.append(error)

    # If any sequences errored out on the metadata service, revert their
    # date_analysis_sofi timestamp
    update_analysis(analysis_timestamp_reverts)


    # Insert approval after matrix has been manipulated
    res = insert_approval(token_info["email"],token_info["institution"], appr)

    return (
        jsonify({"success": appr.to_dict(), "error": errors})
        if res != None
        else abort(400)
    )


def handle_approvals(approvals: Approval, institution: str):
    # Post_and_await_approval always fails when testing on local machine. Disable in debug mode or approvals have no sequences
    if "DEBUG_MODE" in os.environ and  os.environ["DEBUG_MODE"] == "1":
        print("Skipping approval posting in debug mode, would approve/reject:", file=sys.stderr)
        print(approvals, file=sys.stderr)
        return []

    # First, post all approvals and collect request IDs
    approval_requests = []
    for sequence_id, field_mask in approvals.matrix.items():
        required_values = {}
        if sequence_id in approvals.required_values:
            required_values = approvals.required_values[sequence_id]

        try:
            req_id, seq_id = post_approval(sequence_id, field_mask, institution, required_values)
            approval_requests.append((req_id, seq_id))
        except Exception as e:
            # Handle posting errors
            approval_requests.append((None, sequence_id, str(e)))

    # Then, await all approvals and collect errors
    errors = []
    for request_data in approval_requests:
        if len(request_data) == 3:  # Error case from posting
            _, sequence_id, error_msg = request_data
            errors.append((sequence_id, error_msg))
        else:
            req_id, sequence_id = request_data
            if error := await_approval(req_id, sequence_id):
                errors.append(error)

    return errors


def cancel_approval(user, token_info, approval_id: str, sequences: str):
    assert_user_has("approve", token_info)
    res = revoke_approval(token_info["institution"], approval_id, sequences.split(";"))

    if res is None:
        abort(404)
    return None if res.modified_count > 0 else abort(404)


def full_approval_matrix(user, token_info):
    approvals = find_all_active_approvals()
    matrix = {}
    for a in approvals:
        deep_merge(a["matrix"], matrix)
    return jsonify(matrix)


def find_approved_categories(fields: Dict[str, ApprovalStatus]):
    time_fields = []
    for f in fields:
        if fields[f] == ApprovalStatus.APPROVED:
            if f == "st_final":
                time_fields.append("date_approved_st")
            elif f == "qc_final":
                time_fields.append("date_approved_qc")
            elif f == "serotype_final":
                time_fields.append("date_approved_serotype")
            elif f == "toxins_final":
                time_fields.append("date_approved_toxin")
            elif f == "cluster_id":
                time_fields.append("date_approved_cluster")
            elif f == "amr_profile":
                time_fields.append("date_approved_amr")
            elif f == "cdiff_details":
                time_fields.append("date_approved_cdiff")
            elif f == "date_epi":
                time_fields.append("date_epi")

    return time_fields
