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

def get_sample_id_from_sequence_id(sequence_id: str) -> str:
    conn = get_connection()
    mydb = conn[DB_NAME]
    samples = mydb[SAMPLES_COL_NAME]
    id = str(samples.find({"categories.sample_info.summary.sofi_sequence_id": sequence_id}, {"_id": 1}).sort("metadata.updated_at", -1).next()["_id"])
    print(f"Found {id} for seq: {sequence_id}")
    
    return id