from flask import abort
from flask.json import jsonify
from web.src.SAP.generated.models import UserDefinedView
from ..repositories.views import get_views, remove_view, create_view

def get_user_views(user, token_info):
    return jsonify(get_views(user))

def create_user_view(user, token_info, body: UserDefinedView):
    res = create_view(user, body)
    return jsonify(body) if res.inserted_id != None else abort(400)

def delete_view(user, token_info, name: str):
    res = remove_view(user, name)
    return None if res.deleted_count > 0 else abort(404)