# import .database
from typing import Optional
import pymongo
import json
from ...common.database import get_connection, DB_NAME, USERVIEWS_COL_NAME
import sys

def from_cpr(db, cpr_num: str):
    people = db["sap_tbr_metadata"]
    fetch_pipeline = [
        {
            "$lookup": {
                "from": "sap_analysis_results",
                "localField": "isolate_id",
                "foreignField": "isolate_id",
                "as": "isolate",
            }
        },
        {"$unset": ["_id"]},
    ]
    all_res = list(people.aggregate(fetch_pipeline))
    res = list(filter(lambda x: x.get("cpr_nr", -1) == cpr_num, all_res))
    if len(res) > 0:
        return res[0]
    else:
        return {}


def from_cvr(db, cpr_num: str):
    people = db["sap_lims_metadata"]
    fetch_pipeline = [
        {
            "$lookup": {
                "from": "sap_analysis_results",
                "localField": "isolate_id",
                "foreignField": "isolate_id",
                "as": "isolate",
            }
        },
        {"$unset": ["_id"]},
    ]
    all_res = list(people.aggregate(fetch_pipeline))
    res = list(filter(lambda x: x.get("cvr", -1) == cpr_num, all_res))
    if len(res) > 0:
        return res[0]
    else:
        return {}


def from_chr(db, cpr_num: str):
    people = db["sap_lims_metadata"]
    fetch_pipeline = [
        {
            "$lookup": {
                "from": "sap_analysis_results",
                "localField": "isolate_id",
                "foreignField": "isolate_id",
                "as": "isolate",
            }
        },
        {"$unset": ["_id"]},
    ]
    all_res = list(people.aggregate(fetch_pipeline))
    res = list(filter(lambda x: x.get("chr", -1) == cpr_num, all_res))
    if len(res) > 0:
        return res[0]
    else:
        return {}


type_function_mapping = {"CPR": from_cpr, "CVR": from_cvr, "CHR": from_chr}


def personal_data_from_identifier(identifier_type: str, identifier: Optional[str]):
    conn = get_connection()
    db = conn[DB_NAME]
    res = type_function_mapping[identifier_type](db, identifier)
    return res