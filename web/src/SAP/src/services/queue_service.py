import sys
from typing import Dict
from web.src.SAP.generated.models.approval_status import ApprovalStatus
from ...common.config.column_config import internal_approval_fields
from ..repositories.analysis import get_analysis_with_metadata
from ..repositories.metadata import fetch_metadata
from ..repositories.queue import (
    refresh_metadata,
    approve_data,
    await_update_loop,
    ProcessingStatus,
)


class IsolateClosedException(Exception):
    pass


class IsolateReloadException(Exception):
    pass


def post_and_await_reload(isolate_id, institution):
    req_id = refresh_metadata(isolate_id, institution)
    return_status = await_update_loop(req_id)
    print(return_status, file=sys.stderr)
    # TODO UNDO
    #    return None
    if return_status == ProcessingStatus.DONE.value:
        metadata = fetch_metadata(isolate_id, institution)
        metadata.pop("_id", None)
        return metadata
    else:
        # IsolateReloadException(f"Could not reload isolate {isolate_id} due to an error.")
        return {"error": f"Could not reload isolate {isolate_id} due to an error."}, 500


def post_and_await_approval(sequence_id, field_mask, user_institution, required_values):
    data = get_analysis_with_metadata(sequence_id)
    internal_fields = internal_approval_fields()

    fields = {
        col: data.get(col, None)
        for col, val in field_mask.items()
        if val == ApprovalStatus.APPROVED and col not in internal_fields
    }

    institution = data.get("institution", user_institution)
    isolate_id = data.get("isolate_id")

    # For LIMS, date_analysis_sofi should always be implicitly included
    if institution == "FVST":
        fields["date_analysis_sofi"] = data.get("date_analysis_sofi")
        
    for field, val in required_values.items():
        fields[field] = val  

    print(data, file=sys.stderr)
    # TODO UNDO
    #    return None

    req_id = approve_data(isolate_id, sequence_id, fields, institution)
    return_status = await_update_loop(req_id)

    if return_status == ProcessingStatus.DONE.value:
        return None
    else:
        return (
            sequence_id,
            f"Could not approve isolate {sequence_id} due to an error.",
        )
