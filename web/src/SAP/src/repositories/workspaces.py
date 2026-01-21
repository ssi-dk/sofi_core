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


def trim(item):
    item["id"] = str(item["_id"])
    item.pop("_id", None)
    item.pop("username", None)
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


def get_workspaces(user: str):
    workspaces = get_collection(WORKSPACES_COL_NAME)

    found_workspaces = list(map(trim,
        workspaces.find(my_workspaces_query(user))
    ))


    workspace_ids_missing_members = [ObjectId(ws["id"]) for ws in filter(lambda ws: "members" not in ws,found_workspaces)]

    result = workspaces.update_many(
        {
            "_id": {"$in": workspace_ids_missing_members},
        },
        {
            "$set": {"members": [user]}
        }
    )


    if result.modified_count > 0:
        return get_workspaces(user)

    return found_workspaces


def get_workspace_sequences(user: str, workspace_id: str):
    workspaces = get_collection(WORKSPACES_COL_NAME)

    query = my_workspaces_query(user)
    if ObjectId.is_valid(workspace_id):
        query["_id"] = ObjectId(workspace_id)
    else:
        query["name"] = workspace_id
    
    print("GET WS QUERY:",query,file=sys.stderr)

    workspace = trim(
        workspaces.find_one(query)
    )

    print("WS QUERY RES:",workspace,file=sys.stderr)

    


    if workspace is None:
        raise LookupError("Failed to find workspace with id " + workspace_id)

    if workspace["samples"] is None:
        return []

    return workspace["samples"]

# UNUSED IN NEW ITERATIO. ALSO DOES NOT WORK. THIS ALWAYS CRASHES
def get_workspace(user: str, workspace_id: str):
    workspaces = get_collection(WORKSPACES_COL_NAME)

    query = my_workspaces_query(user)
    if ObjectId.is_valid(workspace_id):
        query["_id"] = ObjectId(workspace_id)
    else:
        query["name"] = workspace_id
    
    print("GET WS QUERY:",query,file=sys.stderr)

    workspace = trim(
        workspaces.find_one(query)
    )

    print("WS QUERY RES:",workspace,file=sys.stderr)

    


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


def delete_workspace(user: str, workspace_id: str):
    workspaces = get_collection(WORKSPACES_COL_NAME)

    query = my_workspaces_query(user)
    query["_id"] = ObjectId(workspace_id)

    return workspaces.delete_one(query)

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
            )
        )
    else:
        workspace = trim(
            workspaces.find_one({"created_by": user, "name": cloneWorkspaceInfo.id})
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
