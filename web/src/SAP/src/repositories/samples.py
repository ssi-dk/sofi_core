from typing import Any, Dict
from ...common.database import (
    get_connection,
    DB_NAME,
    SAMPLES_COL_NAME,
)
from bson.objectid import ObjectId

def get_single_sample(sample_id: str) -> Dict[str, Any]:
    conn = get_connection()
    mydb = conn[DB_NAME]
    samples = mydb[SAMPLES_COL_NAME]
    return samples.find_one(ObjectId(sample_id))
