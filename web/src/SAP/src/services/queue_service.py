import sys
from ...generated.models.base_metadata import BaseMetadata
from ...generated.models.lims_metadata import LimsMetadata
from ...generated.models.tbr_metadata import TbrMetadata
from ..repositories.metadata import fetch_metadata
from ..repositories.queue import refresh_metadata, await_update_loop, ProcessingStatus

class IsolateClosedException(Exception):
    pass

class IsolateReloadException(Exception):
    pass


def post_and_await_reload(isolate_id, institution):
    req_id = refresh_metadata(isolate_id, institution)
    return_status = await_update_loop(req_id)
    print(return_status, file=sys.stderr)
    if return_status == ProcessingStatus.DONE.value:
        metadata = fetch_metadata(isolate_id, institution)
        metadata.pop("_id", None)
        return metadata
    else:
        #IsolateReloadException(f"Could not reload isolate {isolate_id} due to an error.")
        return {"error": f"Could not reload isolate {isolate_id} due to an error."}, 500
