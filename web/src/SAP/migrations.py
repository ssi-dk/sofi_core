import sys

from web.src.SAP.common.config.column_config import columns
from web.src.SAP.common.database import MIGRATIONS_COL_NAME,DB_NAME,ANALYSIS_COL_NAME, PROJECT_PRIVACY_COL_NAME, get_connection
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


def enforce_dates():
    conn = get_connection()
    db = conn[DB_NAME]
    analysis_coll = db[ANALYSIS_COL_NAME]
    cols = list(filter(lambda n: n.startswith("date_"),map(lambda c: c["field_name"],columns())))
    for col in cols:
        analysis_coll.update_many(
            {
                "$expr": {
                    "$eq": [{"$type": f"${col}"}, "string"]
                }
            },
            [
                {
                    "$set": {
                        col: {"$toDate": f"${col}"}
                    }
                }
            ]
        )

def create_projects():
    conn = get_connection()
    db = conn[DB_NAME]
    analysis = db[ANALYSIS_COL_NAME]
    
    project_keys_pipeline = [
        {
            "$group": {
            "_id": {
                "institution": "$institution",
                "project_title": "$project_title",
                "project_number": "$project_number"
            }
            }
        },
        {
            "$project": {
                "_id": 0,
                "institution": "$_id.institution",
                "project_title": "$_id.project_title",
                "project_number": "$_id.project_number",

                "project_key": {
                    "$reduce": {
                        "input": {
                            "$filter": {
                            "input": [
                                "$_id.institution",
                                "$_id.project_title",
                                {
                                "$cond": [
                                    { "$ne": ["$_id.project_number", None] },
                                    { "$toString": "$_id.project_number" },
                                    None
                                ]
                                }
                            ],
                            "as": "part",
                            "cond": { "$ne": ["$$part", None] }
                            }
                        },
                        "initialValue": "",
                        "in": {
                            "$cond": [
                            { "$eq": ["$$value", ""] },
                            "$$this",
                            { "$concat": ["$$value", "-", "$$this"] }
                            ]
                        }
                    }
                }
            }
        }
    ]

    project_coll = db[PROJECT_PRIVACY_COL_NAME]

    for project_agg in analysis.aggregate(project_keys_pipeline):

        # Find if old version of this project is private
        private = False
        project_number = None
        if "project_number" in project_agg:
            project_number = int(project_agg["project_number"])
            private = project_coll.find_one({"institution": project_agg["institution"], "project_number": project_number}) is not None


        project_title = project_agg["project_title"] if "project_title" in project_agg else None


        project_coll.insert({
            "project_key": project_agg["project_key"], 
            "is_private": private, 
            "institution": project_agg["institution"], 
            "project_number": project_number,
            "project_title": project_title,
        })

    # Delete old versions
    project_coll.delete_many({"is_private": None})

    #Ensure index on collection primary key
    project_coll.create_index([("project_key", pymongo.DESCENDING)])