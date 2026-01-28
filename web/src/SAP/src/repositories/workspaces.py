import sys
from typing import Any, Dict, List, TypedDict, Union
from bson.objectid import ObjectId
from ...src.security.permission_check import authorized_columns
from ...generated.models.update_workspace import UpdateWorkspace
from ...src.repositories.analysis import (
    get_analysis_with_metadata,
    get_single_analysis_by_object_id,
)
from ...common.database import get_collection, WORKSPACES_COL_NAME
from ...generated.models import CreateWorkspace
from ...generated.models import CloneWorkspace
from ..repositories.samples import get_sample_id_from_sequence_id
import io
from flask import send_file

def migrate_field(found_workspaces: List[Dict], fieldname: str, value) -> bool:
    workspaces = get_collection(WORKSPACES_COL_NAME)

    missing_field = [ObjectId(ws["id"]) for ws in filter(lambda ws: fieldname not in ws, found_workspaces)]
    if len(missing_field) == 0:
        return False
    
    result = workspaces.update_many(
        {
            "_id": {"$in": missing_field},
        },
        {
            "$set": {fieldname: value},
        }
    )

    return result.modified_count > 0

def migrate_workspaces(found_workspaces: List[Dict],user:str,institution:str) -> bool:
    return any([
        migrate_field(found_workspaces,"members", [user]),
        migrate_field(found_workspaces,"institution",institution),
        migrate_field(found_workspaces,"tags",[])
    ])


def trim(item, user: str) -> Dict:
    item["id"] = str(item["_id"])
    item.pop("_id", None)
    item.pop("username", None)

    if "favorites" in item:
        item["isFavorite"] = user in item["favorites"]
    else:
        item["isFavorite"] = False

    return item


def get_sequence(sample_id: str):
    single = get_single_analysis_by_object_id(sample_id)
    sequence = get_analysis_with_metadata(single["sequence_id"])
    return sequence

def my_workspaces_query(user: str)-> dict:
    return {
            "$or": [
                {
                    "members": {"$exists": False},
                    "created_by": user
                },
                {
                    "members": {"$exists": True},
                    "members": user
                }
            ]
        }


def get_workspaces(user: str, institution: str):
    workspaces = get_collection(WORKSPACES_COL_NAME)

    found_workspaces = list(map(lambda x: trim(x,user),
        workspaces.find(my_workspaces_query(user))
    ))

    # If data model needs an update, then perform it and refetch. Otherwise return the data
    if migrate_workspaces(found_workspaces,user,institution):
        return get_workspaces(user,institution)

    return found_workspaces


def get_workspace_sequences(user: str, workspace_id: str):
    workspaces = get_collection(WORKSPACES_COL_NAME)

    query = my_workspaces_query(user)
    if ObjectId.is_valid(workspace_id):
        query["_id"] = ObjectId(workspace_id)
    else:
        query["name"] = workspace_id

    workspace = trim(
        workspaces.find_one(query),
        user
    )

    if workspace is None:
        raise LookupError("Failed to find workspace with id " + workspace_id)

    if workspace["samples"] is None:
        return []

    return workspace["samples"]

# UNUSED IN NEW ITERATION. ALSO DOES NOT WORK. THIS ALWAYS CRASHES
def get_workspace(user: str, workspace_id: str):
    workspaces = get_collection(WORKSPACES_COL_NAME)

    query = my_workspaces_query(user)
    if ObjectId.is_valid(workspace_id):
        query["_id"] = ObjectId(workspace_id)
    else:
        query["name"] = workspace_id
    
    workspace = trim(
        workspaces.find_one(query),
        user
    )

    if workspace is None:
        return workspace

    if workspace["samples"] is None:
        workspace["samples"] = []
    else:
        workspace["samples"] = list(map(get_sequence, workspace["samples"]))

    return workspace

# UNUSED IN NEW INTERATION
def get_workspace_data(user: str, token_info: Dict[str, str], workspace_id: str):
    workspace = get_workspace(user, workspace_id)

    if workspace is None:
        return None

    authorized = authorized_columns(token_info)

    if len(authorized) == 0:
        return None

    csv = ",".join(f'"{column}"' for column in authorized)
    for sample in workspace["samples"]:
        csv += "\n" + ",".join(
            f'"{sample[column]}"' if column in sample and sample[column] else ""
            for column in authorized
        )

    file = io.BytesIO(bytes(csv, "utf-8"))
    return send_file(file, download_name="proj.csv", mimetype="text/csv")


def leave_workspace(user: str, workspace_id: str):
    workspaces = get_collection(WORKSPACES_COL_NAME)

    query = my_workspaces_query(user)
    query["_id"] = ObjectId(workspace_id)

    
    res = workspaces.update_one(query,{
        "$pull": {
            "members": user,
            "favorites": user
        }
    })

    # Delete the workspace if it has no members
    workspaces.delete_many({"members": {"$size": 0}})
    return res

# TODO: Change this to accept multipel samples
def delete_workspace_sample(user: str, workspace_id: str, sample_id: str):
    workspaces = get_collection(WORKSPACES_COL_NAME)

    update_filter = {"created_by": user, "_id": ObjectId(workspace_id)}
    update = {"$pull": {"samples": sample_id}}
    return workspaces.update_one(update_filter, update, upsert=True)


def create_workspace(user: str, workspace: CreateWorkspace):
    workspaces = get_collection(WORKSPACES_COL_NAME)

    if workspace.samples is None:
        workspace.samples = []

    record = {**workspace.to_dict(), "created_by": user}
    return workspaces.update_one(
        {"created_by": user, "name": workspace.name, "members": [user]}, {"$set": record}, upsert=True
    )

# UNUSED IN NEW ITERATION
def create_workspace_from_sequence_ids(user: str, workspace: CreateWorkspace):
    workspaces = get_collection(WORKSPACES_COL_NAME)
    
    if workspace.samples is None:
        workspace.samples = []
        
    workspace.samples = list(map(lambda x: get_sample_id_from_sequence_id(x), workspace.samples))
        
    record = {**workspace.to_dict(), "created_by": user}
    return workspaces.update_one(
        {"created_by": user, "name": workspace.name}, {"$set": record}, upsert=True
    )

# UNUSED IN NEW ITERATION
def clone_workspace(user: str, cloneWorkspaceInfo: CloneWorkspace):
    workspaces = get_collection(WORKSPACES_COL_NAME)

    if ObjectId.is_valid(cloneWorkspaceInfo.id):
        workspace = trim(
            workspaces.find_one(
                {"created_by": user, "_id": ObjectId(cloneWorkspaceInfo.id)}
            ),
            user
        )
    else:
        workspace = trim(
            workspaces.find_one({"created_by": user, "name": cloneWorkspaceInfo.id}),
            user
        )

    if workspace is None:
        return None

    if workspace["samples"] is None:
        workspace["samples"] = []

    return workspaces.insert_one(
        {
            "created_by": user,
            "name": cloneWorkspaceInfo.name,
            "samples": workspace["samples"],
        }
    )

def remove_from_workspace(user, workspace_id: str, samples: List[str]):
    workspaces = get_collection(WORKSPACES_COL_NAME)
    update_filter = my_workspaces_query(user)
    update_filter["_id"] = ObjectId(workspace_id)
    update = {"$pullAll": {"samples": samples}}
    return workspaces.update_one(update_filter, update)

def update_workspace(user: str, workspace_id: str, workspace: UpdateWorkspace):
    workspaces = get_collection(WORKSPACES_COL_NAME)

    update_filter = my_workspaces_query(user)
    update_filter["_id"] = ObjectId(workspace_id)

    update = {"$addToSet": {"samples": {"$each": workspace.samples}}}
    return workspaces.update_one(update_filter, update, upsert=True)

# This endpoint does not have any security??
def update_microreact(microreact_reference):
    workspaces = get_collection(WORKSPACES_COL_NAME)

    update_filter = {"_id": ObjectId(microreact_reference["id"])}
    update = {"$set": {"microreact": microreact_reference["microreact"]}}
    return workspaces.update_one(update_filter, update, upsert=True)

def set_favorite(user: str, workspace_id: str, is_favorite: bool):
    workspaces = get_collection(WORKSPACES_COL_NAME)

    filter = my_workspaces_query(user)
    filter["_id"] = ObjectId(workspace_id)

    update = {
        "$addToSet": {
            "favorites": user
        }
    } if is_favorite else {
        "$pull": {
            "favorites": user
        }
    }

    return workspaces.update_one(filter, update)


def search_workspaces(user:str,institution: str, search_sting, with_tags: List[str], without_tags: List[str]):
    workspaces = get_collection(WORKSPACES_COL_NAME)

    query = {
        "name": {"$regex": search_sting},
        "institution": institution,
        "tags": {"$nin": without_tags}
    }
    if len(with_tags) > 0:
        query["tags"]["$in"] = with_tags


    return list(map(lambda x: trim(x,user),
        workspaces.find(query)
    ))

def get_all_tags(institution: str) ->  List[str]:
    workspaces = get_collection(WORKSPACES_COL_NAME)

    pipeline = [
        {"$match": {"institution": institution}},
        {"$unwind": "$tags"},
        {"$group": {
            "_id": "$tags",
            "count": {"$sum": 1}
        }},
        {"$sort": {"count": -1}},
        {"$project": {
            "_id": 0,
            "tag": "$_id",
            "count": 1
        }}
    ]

    return list(map(lambda t: t["tag"],workspaces.aggregate(pipeline)))

def set_tag(user: str, workspace_id: str,tag: str, add_or_remove: bool):
    workspaces = get_collection(WORKSPACES_COL_NAME)

    query = my_workspaces_query(user)
    query["_id"] = ObjectId(workspace_id)

    if add_or_remove:
        workspaces.update_one(query,{
            "$addToSet": {"tags": tag}
        })
    else:
        workspaces.update_one(query, {
            "$pull": {"tags": tag}
        })
