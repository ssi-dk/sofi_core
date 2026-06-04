

from typing import Dict

from web.src.SAP.common.database import ANALYSIS_CACHE_COL_NAME, ANALYSIS_COL_NAME, DB_NAME, PROJECT_PRIVACY_COL_NAME, get_connection


def get_projects(institution: str):
    key_counts = ensure_up_to_date()

    conn = get_connection()
    db = conn[DB_NAME]
    project_coll = db[PROJECT_PRIVACY_COL_NAME]
    

    
    projects = list(project_coll.find({"institution": institution}))
    for p in projects:
        p["count"] = key_counts[p["project_key"]] if p["project_key"] in key_counts else 0
        del p["_id"]


    return projects

def set_is_private(project_key: str,institution: str, private: bool):
    projects = get_projects(institution)

    # Assert user has access to the project
    if any(p["project_key"] == project_key for p in projects):
        conn = get_connection()
        db = conn[DB_NAME]
        project_coll = db[PROJECT_PRIVACY_COL_NAME]
        project_coll.update_one({"project_key": project_key}, {"$set": {"is_private": private}} )

def ensure_up_to_date() -> Dict[str,int]:
    # First check if the unqiues in the cache are the same as the ones in the project collection
    conn = get_connection()
    db = conn[DB_NAME]
    projects = db[PROJECT_PRIVACY_COL_NAME]
    analysis_cache = db[ANALYSIS_CACHE_COL_NAME]

    real_projects = list(projects.find())

    cache_project_keys = list(analysis_cache.aggregate([{
        "$group": {
            "_id": "$project_key",
            "count": {
                "$count": {}
            }
        }
    }]))

    key_count = {}
    for k in cache_project_keys:
        key_count[k["_id"]] = k["count"]

    if all(map(lambda x: any(x["_id"] == rp["project_key"] for rp in real_projects),cache_project_keys)):
        # All the project keys found in the cache have a corresponding entry in the projects collection
        return key_count
    
    # One or more project cache entires do not have a corresponding entry in the projects collection
    force_update_projects_collection()
    return key_count


def force_update_projects_collection():
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

    current_projects = list(project_coll.find())

    for project_agg in analysis.aggregate(project_keys_pipeline):

        if len(list(filter(lambda x: x["project_key"] == project_agg["project_key"],current_projects))) > 0:
            continue

        project_number = None
        if "project_number" in project_agg:
            project_number = project_agg["project_number"]

        project_coll.insert({"project_key": project_agg["project_key"], "is_private": False, "institution": project_agg["institution"], "project_number": project_number})