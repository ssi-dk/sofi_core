# import .database
import pymongo
import logging
import json
from web.src.SAP.generated.models import BaseMetadata
from ...common.database import get_connection, DB_NAME, MANUAL_METADATA_COL_NAME
import sys

def insert_manual_metadata(metadata):
    conn = get_connection()
    mydb = conn[DB_NAME]
    metadata_col = mydb[MANUAL_METADATA_COL_NAME]
    metadata_col.insert_one(metadata.to_dict())
