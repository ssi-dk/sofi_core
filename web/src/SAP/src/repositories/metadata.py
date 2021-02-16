# import .database
import pymongo
import logging
import json
from web.src.SAP.generated.models import BaseMetadata
from ...common.database import get_connection, DB_NAME, MANUAL_METADATA_COL_NAME, TBR_METADATA_COL_NAME, LIMS_METADATA_COL_NAME
import sys


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
    metadata_col = mydb[TBR_METADATA_COL_NAME if institution == "TBR" else LIMS_METADATA_COL_NAME]
    return metadata_col.find_one({"isolate_id": isolate_id})
