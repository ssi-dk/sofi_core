from web.src.SAP.common.database import MIGRATIONS_COL_NAME,DB_NAME,ANALYSIS_COL_NAME, get_connection
import pymongo

def create_migrations_collection():

    conn = get_connection()
    mydb = conn[DB_NAME]
    if MIGRATIONS_COL_NAME not in mydb.collection_names():
        mydb.create_collection(MIGRATIONS_COL_NAME)


def create_analysis_sequence_index():
    conn = get_connection()
    db = conn[DB_NAME]
    analysis_coll = db[ANALYSIS_COL_NAME]
    analysis_coll.create_index([("timestamp",  pymongo.DESCENDING), ("sequence_ids",  pymongo.DESCENDING)])