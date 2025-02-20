from typing import Any, Dict
from ...generated.models.add_to_cluster import AddToCluster
from ...common.database import (
    get_connection,
    DB_NAME,
    ANALYSIS_COL_NAME,
    SAMPLES_COL_NAME,
)
from pymongo import UpdateOne
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
    
    return id

def add_to_cluster(user: str, samples: AddToCluster):
    if samples.samples is None:
        return None
    conn = get_connection()
    mydb = conn[DB_NAME]
    analysisresultdb = mydb[ANALYSIS_COL_NAME]
    
    sample_ids = list(map(lambda x: get_sample_id_from_sequence_id(x), samples.samples))
    
    updates = []
    
    for sample_id in sample_ids:
        updates.append(UpdateOne({"_id": ObjectId(sample_id)}, {"$set": {"cluster_id": samples.clusterid}}))
    
    analysisresultdb.bulk_write(updates)
    
    return None