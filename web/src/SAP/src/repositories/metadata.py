# import .database
from typing import List
import pymongo
import logging
import json
from web.src.SAP.generated.models import BaseMetadata, Organization
from ...common.database import (
    ANALYSIS_COL_NAME,
    get_connection,
    DB_NAME,
    MANUAL_METADATA_COL_NAME,
    TBR_METADATA_COL_NAME,
    LIMS_METADATA_COL_NAME,
)
import sys


def upsert_analysis_result_for_upload(metadata: BaseMetadata, filenames: List[str]):
    conn = get_connection()
    mydb = conn[DB_NAME]
    metadata_col = mydb[ANALYSIS_COL_NAME]
    metadata_col.update_one(
        {
            "isolate_id": metadata.isolate_id,
        },
        {
            "$set": {
                "sequence_id": metadata.sequence_id,
                "isolate_id": metadata.isolate_id,
                "institution": metadata.institution,
                "manually_uploaded": True,
                "sequence_filename": " ".join(filenames),
            }
        },
        upsert=True,
    )


def upsert_manual_metadata(metadata: BaseMetadata):
    conn = get_connection()
    mydb = conn[DB_NAME]
    metadata_col = mydb[MANUAL_METADATA_COL_NAME]
    metadata_col.update_one(
        {"isolate_id": metadata.isolate_id}, {"$set": metadata.to_dict()}, upsert=True
    )


def fetch_metadata(isolate_id, institution):
    conn = get_connection()
    mydb = conn[DB_NAME]
    metadata_col = mydb[
        TBR_METADATA_COL_NAME
        if institution == Organization.SSI
        else LIMS_METADATA_COL_NAME
    ]
    return metadata_col.find_one({"isolate_id": isolate_id})
