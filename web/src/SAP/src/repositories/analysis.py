# import .database
from datetime import datetime
from typing import Any, Dict
import pymongo
import logging
import json
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
    PROJECT_PRIVACY_COL_NAME,
)
import sys
from bson.objectid import ObjectId

def remove_id(item):
    item.pop("_id", None)
    return item

def get_analysis_page(query, page_size, offset, columns, institution, data_clearance, unique_sequences=True, sorting=None):
    conn, encryption_client = get_connection(with_enc=True)


    if sorting is not None:
        sort_obj = {
            sorting["column"]: pymongo.DESCENDING if sorting["ascending"] else pymongo.ASCENDING,  # For some reason, the frontend defines ascending=true as a decending ordering.
            "_id": pymongo.DESCENDING 
        }
        sort_step = {"$sort": sort_obj}
    else:
        sort_step = {"$sort": {"_id": pymongo.DESCENDING}} if unique_sequences else None

    q = encrypt_dict(encryption_client, query, pii_columns())

    if data_clearance == "own-institution":
        q["institution"] = institution
    column_projection = {x: 1 for x in columns}
    column_projection["id"] = { "$toString": "$_id" }
    mydb = conn[DB_NAME]
    analysis = mydb[ANALYSIS_COL_NAME]
    fetch_pipeline = [
        {
            "$lookup": {
                "from": TBR_METADATA_COL_NAME,
                "localField": "isolate_id",
                "foreignField": "isolate_id",
                "as": "metadata",
            }
        },
        # This removes isolates without metadata.
        # {"$match": {"metadata": {"$ne": []}}},
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
        {
            "$lookup": {
                "from": PROJECT_PRIVACY_COL_NAME,
                "localField": "project_number",
                "foreignField": "project_number",
                "as": "project_privacy",
            }
        } if data_clearance == "cross-institution" else {"$match": {}},
        {
            "$match": {
                "$or": [
                    {"project_privacy": {"$eq": []}},  # No privacy restrictions
                    {"project_privacy.institution": institution}  # User has access to this institution
                ]
            }
        } if data_clearance == "cross-institution" else {"$match": {}},
        {"$lookup": {
            "from": "sap_approvals",
            "let": { "seqId": "$sequence_id" },
            "pipeline": [
                { "$project": { "status": 1, "matrixKeys": { "$objectToArray": "$matrix" } } },
                { "$unwind": "$matrixKeys" },
                { "$match": { "$expr": { "$eq": ["$matrixKeys.k", "$$seqId"] } } },
                { "$limit": 1 }
            ],
            "as": "approval_info"
            }
        },
        {
            "$addFields": {
                "approval_status": {
                    "$ifNull": [{ "$arrayElemAt": ["$approval_info.matrixKeys.v.sequence_id", 0] }, "pending"]
                }
            }
        },
        {
            "$project": {
                "approval_info": 0
            }
        },
        {"$match": q},
        {"$sort": {"_id": pymongo.DESCENDING}},
        {
            "$group": {
            "_id": "$sequence_id",
            "record": { "$first": "$$ROOT" }
            }
        } if unique_sequences else None,
        { "$replaceRoot": { "newRoot": "$record" } } if unique_sequences else None,
        {"$project": column_projection},
        sort_step,
        {"$skip": offset},
        {"$limit": (int(page_size))},
        {"$unset": ["_id", "metadata"]},
    ]

    fetch_pipeline = list(filter(lambda x: x != None, fetch_pipeline))

    # return list(map(remove_id, samples.find(query).sort('run_date',pymongo.DESCENDING).skip(offset).limit(int(page_size) + 2)))
    # For now, there is no handing of missing metadata, so the full_analysis table is used. The above aggregate pipeline should work though.
    return list(analysis.aggregate(fetch_pipeline))

def get_analysis_count(query, institution, data_clearance):
    conn, encryption_client = get_connection(with_enc=True)
    mydb = conn[DB_NAME]
    analysis = mydb[ANALYSIS_COL_NAME]
    q = encrypt_dict(encryption_client, query, pii_columns())

    fetch_pipeline = [
        {
            "$lookup": {
                "from": PROJECT_PRIVACY_COL_NAME,
                "localField": "project_number",
                "foreignField": "project_number",
                "as": "project_privacy",
            }
        } if data_clearance == "cross-institution" else {"$match": {}},
        {
            "$match": {
                "$or": [
                    {"project_privacy": {"$eq": []}},  # No privacy restrictions
                    {"project_privacy.institution": institution}  # User has access to this institution
                ]
            }
        } if data_clearance == "cross-institution" else {"$match": {}},
        {"$lookup": {
            "from": "sap_approvals",
            "let": { "seqId": "$sequence_id" },
            "pipeline": [
                { "$project": { "status": 1, "matrixKeys": { "$objectToArray": "$matrix" } } },
                { "$unwind": "$matrixKeys" },
                { "$match": { "$expr": { "$eq": ["$matrixKeys.k", "$$seqId"] } } },
                { "$limit": 1 }
            ],
            "as": "approval_info"
            }
        },
        {
            "$addFields": {
                "approval_status": {
                    "$ifNull": [{ "$arrayElemAt": ["$approval_info.matrixKeys.v.sequence_id", 0] }, "pending"]
                }
            }
        },
        {
            "$project": {
                "approval_info": 0
            }
        },
        { "$match": q },
        {
            "$group": {
                "_id": "$sequence_id",
                "record": { "$first": "$sequence_id" }
            }
        },
        { "$count": "record" },
        { "$project": { "count": "$record"}}
    ]

    res = list(analysis.aggregate(fetch_pipeline))
    if len(res) == 1:
        return res[0]["count"]
    else:
        return 0

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

    print("is in analysis.py result")
    print(res)

    if len(res) == 1:
        return res[0]
    else:
        return None

def get_filter_metadata(authorized_columns, institution, data_clearance, cache={}):
    """
    Get filter metadata without applying any query filters.
    Returns min/max dates and distinct values for various fields.
    """

    # This function is ~~very~~ slow. Around 4 secs on 800 rows, and is executed on every query.
    # Temporary fix using a cache. Cache resets every hour
    if "value" in cache and "timestamp" in cache and (datetime.now() -  cache["timestamp"]).total_seconds() < 3600:
        print("MD CACHE HIT",file=sys.stderr)
        return cache["value"]

    conn = get_connection()
    mydb = conn[DB_NAME]
    analysis = mydb[ANALYSIS_COL_NAME]
    
    # Base pipeline for joining metadata collections (same as get_analysis_page)
    base_pipeline = [
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
        {
            "$lookup": {
                "from": PROJECT_PRIVACY_COL_NAME,
                "localField": "project_number",
                "foreignField": "project_number",
                "as": "project_privacy",
            }
        } if data_clearance == "cross-institution" else {"$match": {}},
        {
            "$match": {
                "$or": [
                    {"project_privacy": {"$eq": []}},  # No privacy restrictions
                    {"project_privacy.institution": institution}  # User has access to this institution
                ]
            }
        } if data_clearance == "cross-institution" else {"$match": {}},
    ]
    
    # Apply institution filter for own-institution clearance
    if data_clearance == "own-institution":
        base_pipeline.append({"$match": {"institution": institution}})
    
    # Filter out None stages
    base_pipeline = list(filter(lambda x: x != {"$match": {}}, base_pipeline))
    
    metadata = {}
    
    # Get date ranges for date_sample
    if "date_sample" in authorized_columns:
        date_sample_pipeline = base_pipeline + [
            {
                "$match": {
                    "date_sample": {"$exists": True, "$ne": None}
                }
            },
            {
                "$group": {
                    "_id": None,
                    "min_date": {"$min": "$date_sample"},
                    "max_date": {"$max": "$date_sample"}
                }
            }
        ]
        
        result = list(analysis.aggregate(date_sample_pipeline))
        if result:
            metadata["min_date_sample"] = result[0]["min_date"]
            metadata["max_date_sample"] = result[0]["max_date"]
    
    # Get date ranges for date_received
    if "date_received" in authorized_columns:
        date_received_pipeline = base_pipeline + [
            {
                "$match": {
                    "date_received": {"$exists": True, "$ne": None}
                }
            },
            {
                "$group": {
                    "_id": None,
                    "min_date": {"$min": "$date_received"},
                    "max_date": {"$max": "$date_received"}
                }
            }
        ]
        
        result = list(analysis.aggregate(date_received_pipeline))
        if result:
            metadata["min_date_received"] = result[0]["min_date"]
            metadata["max_date_received"] = result[0]["max_date"]
    
    # Define categorical fields and their corresponding authorization check names
    categorical_fields = {
        "institutions": "institution",
        "project_titles": "project_title", 
        "project_numbers": "project_number",
        "animals": "animal",
        "run_ids": "run_id",
        "isolate_ids": "isolate_id",
        "fud_nos": "fud_no",
        "cluster_ids": "cluster_id",
        "qc_provided_species": "qc_provided_species",
        "serotype_finals": "serotype_final",
        "st_finals": "st_final"
    }
    
    # Get distinct values for categorical fields
    for metadata_key, field_name in categorical_fields.items():
        if field_name in authorized_columns:
            distinct_pipeline = base_pipeline + [
                {
                    "$match": {
                        field_name: {"$exists": True, "$ne": None, "$ne": ""}
                    }
                },
                {
                    "$group": {
                        "_id": f"${field_name}"
                    }
                },
                {
                    "$sort": {"_id": 1}
                },
                {
                    "$project": {
                        "_id": 0,
                        "value": "$_id"
                    }
                }
            ]
            
            result = list(analysis.aggregate(distinct_pipeline))
            metadata[metadata_key] = [item["value"] for item in result if item["value"] is not None]
    
    cache["value"] = metadata
    cache["timestamp"] = datetime.now()

    return metadata