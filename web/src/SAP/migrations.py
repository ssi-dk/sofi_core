import sys
import pymongo
from bson.binary import Binary

from web.src.SAP.common.config.column_config import columns, pii_columns
from web.src.SAP.common.database import MIGRATIONS_COL_NAME, DB_NAME, ANALYSIS_COL_NAME, PROJECT_PRIVACY_COL_NAME, get_connection, get_raw_connection, encrypt_dict
from web.src.SAP.src.repositories.analysis import invalidate_analysis_cache

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

def encrypt_plaintext_pii_fields(is_dry_run=True):
    raw_conn = get_raw_connection()
    _, encryption_client = get_connection(with_enc=True)

    db = raw_conn[DB_NAME]
    analysis = db[ANALYSIS_COL_NAME]

    pii_fields = pii_columns()

    documents_scanned = 0
    documents_with_unencrypted_pii = 0
    unencrypted_fields = 0

    print(f"Starting PII encryption migration (dry_run={is_dry_run})")

    for document in analysis.find():
        documents_scanned += 1

        fields_to_encrypt = {}

        for field in pii_fields:
            if field not in document:
                continue

            value = document[field]

            if value is None:
                continue

            # Encrypted MongoDB values use BSON binary subtype 6
            if isinstance(value, Binary) and value.subtype == 6:
                continue

            fields_to_encrypt[field] = value

        if not fields_to_encrypt:
            continue

        documents_with_unencrypted_pii += 1
        unencrypted_fields += len(fields_to_encrypt)

        print(f"Document with sequence_id {document['sequence_id']} has unencrypted PII fields: {list(fields_to_encrypt.keys())}")

        if not is_dry_run:
            encrypted_fields = encrypt_dict(
                encryption_client,
                fields_to_encrypt,
                pii_fields,
            )
            analysis.update_one(
                {"_id": document["_id"]},
                {"$set": encrypted_fields},
            )

    changes_applied = not is_dry_run and documents_with_unencrypted_pii > 0

    if changes_applied:
        invalidate_analysis_cache()

    print(f"Documents scanned: {documents_scanned}")
    print(f"Documents with unencrypted PII: {documents_with_unencrypted_pii}")
    print(f"Unencrypted PII fields: {unencrypted_fields}")
    print(f"Dry run: {is_dry_run}")
    print(f"Values encrypted and cache invalidated: {changes_applied}")