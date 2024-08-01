from flask import abort
from flask.json import jsonify
from ..repositories.workspaces import get_workspaces as get_workspaces_db
from ..repositories.workspaces import delete_workspace as delete_workspace_db
from ..repositories.workspaces import delete_workspace_sample as delete_workspace_sample_db
from ..repositories.workspaces import create_workspace as create_workspace_db
from ..repositories.workspaces import update_workspace as update_workspace_db
from ..repositories.workspaces import get_workspace as get_workspace_db

def get_workspaces(user, token_info):
    return jsonify(get_workspaces_db(user))

def delete_workspace(user, token_info, workspace_id: str):
    res = delete_workspace_db(user, workspace_id)
    return None if res.deleted_count > 0 else abort(404)

def create_workspace(user, token_info, body):
    res = create_workspace_db(user, body)

    if res.upserted_id:
        return jsonify({"id": str(res.upserted_id)})

    return jsonify(body)

def post_workspace(user, token_info, workspace_id: str, body):
    update_workspace_db(user, workspace_id, body)

    return jsonify(body)

def get_workspace(user, token_info, workspace_id: str):
    return jsonify(get_workspace_db(user, workspace_id))

def delete_workspace_sample(user, token_info, workspace_id, sample_id):
    res = delete_workspace_sample_db(user, workspace_id, sample_id)
    return None if res.modified_count > 0 else abort(404)
