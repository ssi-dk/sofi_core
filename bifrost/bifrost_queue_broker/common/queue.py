from enum import Enum

class ProcessingStatus(Enum):
    WAITING = 1
    PROCESSING = 2
    DONE = 3
    ERROR = 4
    ISOLATE_CLOSED = 5

org_service_map = {
    "FVST": "LIMS",
    "SSI": "TBR"
}

def create_fetch_request(isolate_id, institution):
  return {"status": 1, "service": org_service_map[institution], "isolate_id": isolate_id, "request_type": "fetch"}
