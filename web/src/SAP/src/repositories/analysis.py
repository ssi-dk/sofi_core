# import .database
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
)
import sys
from bson.objectid import ObjectId

def remove_id(item):
    item.pop("_id", None)
    return item

def get_analysis_page(query, page_size, offset, columns, restrict_to_institution, unique_sequences=True):
    conn, encryption_client = get_connection(with_enc=True)

    # TODO remove print later
    print(f"query before value encrypt: \n{query}")

    q = encrypt_dict(encryption_client, query, pii_columns())

    print(f"query after value encrypt: \n{q}")

    if restrict_to_institution:
        q["institution"] = restrict_to_institution
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
        {"$match": q},
        {"$sort": {"_id": pymongo.DESCENDING}},

        {
            "$group": {
            "_id": "$sequence_id",
            "record": { "$first": "$$ROOT" }
            }
        } if unique_sequences else None,
        { "$replaceRoot": { "newRoot": "$record" } } if unique_sequences else None,
        {"$sort": {"_id": pymongo.DESCENDING}} if unique_sequences else None,

        {"$skip": offset},
        {"$limit": (int(page_size))},
        {"$project": column_projection},
        {"$unset": ["_id", "metadata"]},
    ]

    fetch_pipeline = list(filter(lambda x: x != None, fetch_pipeline))

    # return list(map(remove_id, samples.find(query).sort('run_date',pymongo.DESCENDING).skip(offset).limit(int(page_size) + 2)))
    # For now, there is no handing of missing metadata, so the full_analysis table is used. The above aggregate pipeline should work though.
    return list(analysis.aggregate(fetch_pipeline))


def get_analysis_count(query):
    conn, encryption_client = get_connection(with_enc=True)
    mydb = conn[DB_NAME]
    analysis = mydb[ANALYSIS_COL_NAME]
    q = encrypt_dict(encryption_client, query, pii_columns())

    fetch_pipeline = [
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
        analysis.update_one({"sequence_id": u["id"]}, {"$set": u})


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
