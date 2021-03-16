# import .database
from typing import Any, Dict
import pymongo
import logging
import json
from web.src.SAP.generated.models import AnalysisResult
from ...common.database import get_connection, DB_NAME, ANALYSIS_COL_NAME
import sys


def remove_id(item):
    item.pop("_id", None)
    return item


# TODO: only select the latest document pr. isolate id.
def get_analysis_page(query, page_size, offset):
    conn = get_connection()
    mydb = conn[DB_NAME]
    samples = mydb["sap_analysis_results"]
    fetch_pipeline = [
        {"$match": query},
        {
            "$lookup": {
                "from": "sap_tbr_metadata",
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
        {"$unset": ["_id", "metadata"]},
        {"$sort": {"run_date": pymongo.DESCENDING}},
        {"$skip": offset},
        {"$limit": (int(page_size) + 2)},
    ]

    # return list(map(remove_id, samples.find(query).sort('run_date',pymongo.DESCENDING).skip(offset).limit(int(page_size) + 2)))
    # For now, there is no handing of missing metadata, so the full_analysis table is used. The above aggregate pipeline should work though.
    return list(samples.aggregate(fetch_pipeline))


def get_analysis_count(query):
    conn = get_connection()
    mydb = conn[DB_NAME]
    samples = mydb[ANALYSIS_COL_NAME]

    return samples.find(query).count()


def update_analysis(change):
    conn = get_connection()
    mydb = conn[DB_NAME]
    samples = mydb[ANALYSIS_COL_NAME]
    updates = map(lambda x: {**change[x], "id": x}, change.keys())
    for u in updates:
        samples.update_one({"isolate_id": u["id"]}, {"$set": u})


def get_single_analysis(identifier: str) -> Dict[str, Any]:
    conn = get_connection()
    mydb = conn[DB_NAME]
    samples = mydb[ANALYSIS_COL_NAME]
    return samples.find_one({"isolate_id": f"{identifier}"})
