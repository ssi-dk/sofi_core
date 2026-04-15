# import .database
from datetime import datetime
import re
from typing import Any, Dict, List, Optional
import flask
import pymongo
import logging
import json
from datetime import datetime, timedelta
from web.src.SAP.generated.models import AnalysisResult
from ...common.config.column_config import pii_columns
from ...common.database import (
    LIMS_METADATA_COL_NAME,
    MANUAL_METADATA_COL_NAME,
    TBR_METADATA_COL_NAME,
    get_connection,
    encrypt_dict,
    DB_NAME,
    ANALYSIS_COL_NAME,
    ANALYSIS_CACHE_COL_NAME,
    PROJECT_PRIVACY_COL_NAME,
)
import sys
from bson.objectid import ObjectId

def remove_id(item):
    item.pop("_id", None)
    return item




last_updated_timestamp = None
CACHE_TTL = timedelta(minutes=5)

def invalidate_analysis_cache():
    global last_updated_timestamp
    last_updated_timestamp = None

def ensure_cache_updated():
    global last_updated_timestamp

    now = datetime.utcnow()

    # Case 1: never updated or invalidated
    if last_updated_timestamp is None:
        update_analysis_cache()
        last_updated_timestamp = now
        return

    # Case 2: expired
    if now - last_updated_timestamp > CACHE_TTL:
        update_analysis_cache()
        last_updated_timestamp = now

def update_analysis_cache():
    conn, encryption_client = get_connection(with_enc=True)
    mydb = conn[DB_NAME]
    analysis = mydb[ANALYSIS_COL_NAME]

    pipeline = [
        {
            "$lookup": {
                "from": TBR_METADATA_COL_NAME,
                "localField": "isolate_id",
                "foreignField": "isolate_id",
                "as": "metadata",
            }
        },
        {
            "$replaceRoot": {
                "newRoot": {"$mergeObjects": [{"$arrayElemAt": ["$metadata", 0]}, "$$ROOT"]}
            }
        },
        {
            "$lookup": {
                "from": LIMS_METADATA_COL_NAME,
                "localField": "isolate_id",
                "foreignField": "isolate_id",
                "as": "metadata",
            }
        },
        {
            "$replaceRoot": {
                "newRoot": {"$mergeObjects": [{"$arrayElemAt": ["$metadata", 0]}, "$$ROOT"]}
            }
        },
        {
            "$lookup": {
                "from": MANUAL_METADATA_COL_NAME,
                "localField": "isolate_id",
                "foreignField": "isolate_id",
                "as": "metadata",
            }
        },
        {
            "$replaceRoot": {
                "newRoot": {"$mergeObjects": [{"$arrayElemAt": ["$metadata", 0]}, "$$ROOT"]}
            }
        },
        {"$out": ANALYSIS_CACHE_COL_NAME}
    ]

    analysis.aggregate(pipeline)

def get_analysis_page_bundle(
    query,
    page_size,
    offset,
    columns,
    institution,
    data_clearance,
    unique_sequences=True,
    sorting=None,
    workspace_items: Optional[List[str]] = None,
):

    ensure_cache_updated()

    conn, encryption_client = get_connection(with_enc=True)
    mydb = conn[DB_NAME]
    analysis_cache = mydb[ANALYSIS_CACHE_COL_NAME]

    q = encrypt_dict(encryption_client, query or {}, pii_columns())

    if data_clearance == "own-institution":
        q["institution"] = institution

    column_projection = {x: 1 for x in columns}
    column_projection["id"] = {"$toString": "$_id"}

    auth_projection = {x: 1 for x in columns}
    auth_projection["id"] = {"$toString": "$_id"}

    if sorting is not None:
        sort_obj = {
            sorting["column"]: pymongo.DESCENDING
            if sorting["ascending"]
            else pymongo.ASCENDING,
            "_id": pymongo.DESCENDING,
        }
    else:
        sort_obj = {"_id": pymongo.DESCENDING}

    distinct = [
        "institution",
        "project_title",
        "project_number",
        "animal",
        "run_id",
        "isolate_id",
        "fud_number",
        "cluster_id",
        "qc_provided_species",
        "serotype_final",
        "st_final",
    ]

    distinct_group = {"_id": None}
    for field in distinct:
        distinct_group[field] = {"$addToSet": f"${field}"}

    base_pipeline = [
        {
            "$lookup": {
                "from": PROJECT_PRIVACY_COL_NAME,
                "localField": "project_number",
                "foreignField": "project_number",
                "as": "project_privacy",
            }
        }
        if data_clearance == "cross-institution"
        else None,
        {
            "$match": {
                "$or": [
                    {"project_privacy": {"$eq": []}},
                    {"project_privacy.institution": institution},
                ]
            }
        }
        if data_clearance == "cross-institution"
        else None,
        {
            "$lookup": {
                "from": "sap_approvals",
                "localField": "sequence_id",
                "foreignField": "sequence_ids",
                "pipeline": [
                    { "$match": { "status": "submitted" } },
                    { "$sort": { "timestamp": -1 } },
                    { "$limit": 1 }
                ],
                "as": "approval_info"
            }
        },
        {
            "$set": {
                "approval_info": { "$first": "$approval_info" }
            }
        },
        {
            "$set": {
                "matched_matrix_entry": {
                    "$first": {
                        "$map": {
                            "input": {
                            "$filter": {
                                "input": {
                                    "$objectToArray":
                                        "$approval_info.matrix"
                                    },
                                    "as": "m",
                                    "cond": {
                                    "$eq": ["$$m.k", "$sequence_id"]
                                }
                            }
                            },
                            "as": "m",
                            "in": "$$m.v"
                        }
                    }
                }
            }
        },
        {
            "$addFields": {
            "approval_status": {
                "$ifNull": [
                    "$matched_matrix_entry.sequence_id",
                    "pending"
                ]
            }
            }
        },
        {"$project": {"approval_info": 0}},
        {
            "$match": {
                "$or": [
                    {"_id": {"$in": workspace_items}},
                    {"_id": {"$in": list(map(lambda id: ObjectId(id), workspace_items))}}
                ]
            }
        } if workspace_items else None,
        {"$match": q} if q else None,
        {"$sort": {"_id": pymongo.DESCENDING}},
        {
            "$group": {"_id": "$sequence_id", "record": {"$first": "$$ROOT"}}
        }
        if unique_sequences
        else None,
        {"$replaceRoot": {"newRoot": "$record"}} if unique_sequences else None
    ]

    base_pipeline = list(filter(lambda x: x is not None, base_pipeline))

    pipeline = base_pipeline + [
        {
            "$facet": {
                "items": [
                    {"$project": column_projection},
                    {"$sort": sort_obj},
                    {"$skip": offset},
                    {"$limit": int(page_size)},
                    {"$unset": ["_id", "metadata"]},
                ],
                "count": [
                    {"$count": "count"}
                ],
                "filter_op": [
                    {"$project": auth_projection},
                    {"$group": distinct_group},
                    {"$project": {"_id": 0}},
                ],
            }
        }
    ]
    res = list(analysis_cache.aggregate(pipeline))[0]

    count = res["count"][0]["count"] if res["count"] else 0
    md = res["filter_op"][0] if res["filter_op"] else {}

    filter_options = {
        "institutions": md.get("institution", []),
        "project_titles": md.get("project_title", []),
        "project_numbers": md.get("project_number", []),
        "run_ids": md.get("run_id", []),
        "isolate_ids": md.get("isolate_id", []),
        "cluster_ids": md.get("cluster_id", []),
        "qc_provided_species": md.get("qc_provided_species", []),
        "serotype_finals": md.get("serotype_final", []),
        "st_finals": md.get("st_final", []),
        "fud_numbers": md.get("fud_number",[])
    }

    for k in filter_options:
        filter_options[k] = list(filter(lambda v: v is not None, filter_options[k]))

    return {
        "items": res["items"],
        "count": count,
        "filter_op": filter_options,
    }


def update_analysis(change):
    conn = get_connection()
    mydb = conn[DB_NAME]
    analysis = mydb[ANALYSIS_COL_NAME]
    updates = map(lambda x: {**change[x], "id": x}, change.keys())
    for u in updates:
        # Create update object with userchanged_ prefixed fields, this is used in the analysis pipeline to avoid changing fields that contain user data
        update_data = u.copy()
        # For each field being updated (except 'id'), add a userchanged_ version
        for field_name in u.keys():
            if field_name != "id":
                update_data[f"userchanged_{field_name}"] = True
        analysis.update_one({"sequence_id": update_data["id"]}, {"$set": update_data})
    
    invalidate_analysis_cache()


def get_single_analysis(id: str) -> Dict[str, Any]:
    conn = get_connection()
    mydb = conn[DB_NAME]
    analysis = mydb[ANALYSIS_COL_NAME]
    return analysis.find_one({"sequence_id": f"{id}"}, {"_id": 0})

def get_single_analysis_by_object_id(id: str) -> Dict[str, Any]:
    conn = get_connection()
    mydb = conn[DB_NAME]
    analysis = mydb[ANALYSIS_COL_NAME]
    return analysis.find_one(ObjectId(id))

def get_analysis_with_metadata(sequence_id: str) -> Dict[str, Any]:
    conn = get_connection()
    mydb = conn[DB_NAME]
    analysis = mydb[ANALYSIS_COL_NAME]

    fetch_pipeline = [
        {"$match": {"sequence_id": sequence_id}},
        {"$sort": {"_id": pymongo.DESCENDING}},
        {
            "$lookup": {
                "from": TBR_METADATA_COL_NAME,
                "localField": "isolate_id",
                "foreignField": "isolate_id",
                "as": "metadata",
            }
        },
        {
            "$replaceRoot": {
                "newRoot": {
                    "$mergeObjects": [{"$arrayElemAt": ["$metadata", 0]}, "$$ROOT"]
                }
            }
        },
        {
            "$lookup": {
                "from": LIMS_METADATA_COL_NAME,
                "localField": "isolate_id",
                "foreignField": "isolate_id",
                "as": "metadata",
            }
        },
        {
            "$replaceRoot": {
                "newRoot": {
                    "$mergeObjects": [{"$arrayElemAt": ["$metadata", 0]}, "$$ROOT"]
                }
            }
        },
        {
            "$lookup": {
                "from": MANUAL_METADATA_COL_NAME,
                "localField": "isolate_id",
                "foreignField": "isolate_id",
                "as": "metadata",
            }
        },
        {
            "$replaceRoot": {
                "newRoot": {
                    "$mergeObjects": [{"$arrayElemAt": ["$metadata", 0]}, "$$ROOT"]
                }
            }
        },
        {"$set": { "id": {"$toString": "$_id"}}},
        {"$unset": ["_id", "metadata"]},
        {"$limit": (int(1))},
    ]

    res = list(analysis.aggregate(fetch_pipeline))

    if len(res) == 1:
        return res[0]
    else:
        return None
