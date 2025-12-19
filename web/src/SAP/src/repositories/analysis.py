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

def get_filter_metadata(authorized_columns, institution, data_clearance):
    """
    Get filter metadata without applying any query filters.
    Returns min/max dates and distinct values for various fields.
    """

    distinct = ["institution","project_title","project_number","animal","run_id","isolate_id","fud_no","cluster_id","qc_provided_species","serotype_final","st_final"]
    distinct_group = {"_id": None}

    for field in distinct:
        distinct_group[field] = {"$addToSet": f"${field}"}


    conn, encryption_client = get_connection(with_enc=True)

    q = encrypt_dict(encryption_client, {}, pii_columns())

    if data_clearance == "own-institution":
        q["institution"] = institution
    column_projection = {x: 1 for x in authorized_columns}
    column_projection["id"] = { "$toString": "$_id" }
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
        {"$project": column_projection},
        {"$unset": ["_id", "metadata"]},
        {"$group": distinct_group},
        {"$project": {"_id": 0}}
    ]

    result = list(analysis.aggregate(pipeline))
    distinct_values = result[0] if result else {}

    metadata = {
        "institutions": distinct_values["institution"],
        "project_titles": distinct_values["project_title"],
        "project_numbers": distinct_values["project_number"],
        "run_ids": distinct_values["run_id"],
        "isolate_ids": distinct_values["isolate_id"],
        "cluster_ids": distinct_values["cluster_id"],
        "qc_provided_species": distinct_values["qc_provided_species"],
        "serotype_finals": distinct_values["serotype_final"],
        "st_finals": distinct_values["st_final"]
    }
    return metadata