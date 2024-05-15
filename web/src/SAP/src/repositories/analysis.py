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


def remove_id(item):
    item.pop("_id", None)
    return item


# TODO: only select the latest document pr. isolate id.
def get_analysis_page(query, page_size, offset, columns, restrict_to_institution):
    conn, encryption_client = get_connection(with_enc=True)
    q = encrypt_dict(encryption_client, query, pii_columns())
    if restrict_to_institution:
        q["institution"] = restrict_to_institution
    column_projection = {x: 1 for x in columns}
    column_projection["id"] = { "$toString": "$_id" }
    mydb = conn[DB_NAME]
    samples = mydb[ANALYSIS_COL_NAME]
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
        {"$skip": offset},
        {"$limit": (int(page_size))},
        {"$project": column_projection},
        {"$unset": ["_id", "metadata"]},
    ]
    # return list(map(remove_id, samples.find(query).sort('run_date',pymongo.DESCENDING).skip(offset).limit(int(page_size) + 2)))
    # For now, there is no handing of missing metadata, so the full_analysis table is used. The above aggregate pipeline should work though.
    return list(samples.aggregate(fetch_pipeline))


def get_analysis_count(query):
    conn, encryption_client = get_connection(with_enc=True)
    mydb = conn[DB_NAME]
    samples = mydb[ANALYSIS_COL_NAME]
    q = encrypt_dict(encryption_client, query, pii_columns())

    return samples.find(q).count()


def update_analysis(change):
    conn = get_connection()
    mydb = conn[DB_NAME]
    samples = mydb[ANALYSIS_COL_NAME]
    updates = map(lambda x: {**change[x], "id": x}, change.keys())
    for u in updates:
        samples.update_one({"sequence_id": u["id"]}, {"$set": u})


def get_single_analysis(identifier: str) -> Dict[str, Any]:
    conn = get_connection()
    mydb = conn[DB_NAME]
    samples = mydb[ANALYSIS_COL_NAME]
    return samples.find_one({"sequence_id": f"{identifier}"}, {"_id": 0})


def get_analysis_with_metadata(sequence_id: str) -> Dict[str, Any]:
    conn = get_connection()
    mydb = conn[DB_NAME]
    samples = mydb[ANALYSIS_COL_NAME]

    fetch_pipeline = [
        {"$match": {"sequence_id": sequence_id}},
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
        {"$unset": ["_id", "metadata"]},
        {"$limit": (int(1))},
    ]

    res = list(samples.aggregate(fetch_pipeline))
    if len(res) == 1:
        return res[0]
    else:
        return None
