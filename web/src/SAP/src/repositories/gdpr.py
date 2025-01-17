# import .database
from typing import Optional
import pymongo
import json
from ...common.database import (
    get_connection,
    DB_NAME,
    USERVIEWS_COL_NAME,
    yield_chunks,
)
from ...common.config.column_config import pii_columns
import sys

PII_FIELDS = pii_columns()


def lookup_pipeline():
    return [
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


def from_cpr(db, cpr_num: str):
    people = db["sap_tbr_metadata"]
    all_entries = people.aggregate(lookup_pipeline())
    result = []
    for batch in yield_chunks(all_entries):
        filtered = list(filter(lambda x: x.get("cpr_nr", -1) == cpr_num, batch))
        result.extend(filtered)
    if len(result) > 0:
        return result
    return {}


def from_cvr(db, cvr_num: str):
    people = db["sap_lims_metadata"]
    all_entries = people.aggregate(lookup_pipeline())
    result = []
    for batch in yield_chunks(all_entries):
        filtered = list(filter(lambda x: x.get("cvr_number", -1) == cvr_num, batch))
        result.extend(filtered)
    if len(result) > 0:
        return result
    return {}


def from_chr(db, chr_num: str):
    people = db["sap_lims_metadata"]
    all_entries = people.aggregate(lookup_pipeline())
    result = []
    for batch in yield_chunks(all_entries):
        filtered = list(filter(lambda x: x.get("chr_number", -1) == chr_num, batch))
        result.extend(filtered)
    if len(result) > 0:
        return result
    return {}


data_dump_mapping = {"CPR": from_cpr, "CVR": from_cvr, "CHR": from_chr}


def personal_data_from_identifier(identifier_type: str, identifier: Optional[str]):
    conn = get_connection()
    db = conn[DB_NAME]
    res = data_dump_mapping[identifier_type](db, identifier)
    return res


def del_cpr(db, cpr_num: str):
    people = db["sap_tbr_metadata"]
    result = []
    isolate_id = []
    for batch in yield_chunks(people.find()):
        filtered = list(filter(lambda x: x.get("cpr_nr", -1) == cpr_num, batch))
        result.extend(filtered)
    if len(result) > 0:
        cleared_values = {key: "" for key in PII_FIELDS}
        isolate_id = [x["isolate_id"] for x in result]
        ids = [x["_id"] for x in result]
        people.update(
            {"_id": {"$in": ids}},
            {"$set": {"gdpr_deleted": True}, "$unset": cleared_values},
        )
    return len(result), isolate_id


def del_cvr(db, cvr_num: str):
    people = db["sap_lims_metadata"]
    result = []
    isolate_id = []
    for batch in yield_chunks(people.find()):
        filtered = list(filter(lambda x: x.get("cvr_number", -1) == cvr_num, batch))
        result.extend(filtered)
    if len(result) > 0:
        cleared_values = {key: "" for key in PII_FIELDS}
        isolate_id = [x["isolate_id"] for x in result]
        ids = [x["_id"] for x in result]
        people.update(
            {"_id": {"$in": ids}},
            {"$set": {"gdpr_deleted": True}, "$unset": cleared_values},
        )
    return len(result), isolate_id


def del_chr(db, chr_num: str):
    people = db["sap_lims_metadata"]
    result = []
    isolate_id = []
    for batch in yield_chunks(people.find()):
        filtered = list(filter(lambda x: x.get("chr_number", -1) == chr_num, batch))
        result.extend(filtered)
    if len(result) > 0:
        cleared_values = {key: "" for key in PII_FIELDS}
        isolate_id = [x["isolate_id"] for x in result]
        ids = [x["_id"] for x in result]
        people.update(
            {"_id": {"$in": ids}},
            {"$set": {"gdpr_deleted": True}, "$unset": cleared_values},
        )
    return len(result), isolate_id


delete_user_mapping = {"CPR": del_cpr, "CVR": del_cvr, "CHR": del_chr}


def forget_user_data(identifier_type: str, identifier: Optional[str]):
    conn = get_connection()
    db = conn[DB_NAME]
    num_updated, ids = delete_user_mapping[identifier_type](db, identifier)
    return {"data": str(num_updated) if num_updated > 0 else ""}, ids
