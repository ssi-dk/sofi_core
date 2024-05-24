import sys
from flask import abort
from flask.json import jsonify
from ..repositories.workspaces import get_workspaces as get_workspaces_db
from ..repositories.workspaces import delete_workspace as delete_workspace_db

def get_workspaces(user, token_info):
    return jsonify(get_workspaces_db(user))

def delete_workspace(user, token_info, workspace_id: str):
    res = delete_workspace_db(user, workspace_id)
    return None if res.deleted_count > 0 else abort(404)
