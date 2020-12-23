from flask import abort
from flask.json import jsonify
from web.src.SAP.generated.models import UserDefinedView
from ..repositories.views import get_views, remove_view, create_view

def get_user_views():
    # TODO: figure out real username from claim
    username = "demo"
    return jsonify(get_views(username))

def create_user_view(body: UserDefinedView):
    # TODO: figure out real username from claim
    username = "demo"
    res = create_view(username, body)
    return jsonify(body) if res.inserted_id != None else abort(400)

def delete_view(name: str):
    # TODO: figure out real username from claim
    username = "demo"
    res = remove_view(username, name)
    return None if res.deleted_count > 0 else abort(404)