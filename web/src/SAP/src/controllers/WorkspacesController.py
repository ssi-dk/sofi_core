from flask.json import jsonify
from ..repositories.workspaces import get_workspaces as get_workspaces_db

def get_workspaces(user, token_info):
    return jsonify(get_workspaces_db(user))


