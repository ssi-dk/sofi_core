from flask import abort
from flask.json import jsonify
from web.src.SAP.generated.models import UserDefinedView, UserInfo
from ..repositories.views import get_views, remove_view, create_view
from web.src.SAP.src.security.permission_check import list_permissions


def who_am_i(user, token_info):
    groups=[]
    if "security-groups" in token_info:
        groups=[item.lstrip('/') for item in token_info["security-groups"]]

    return jsonify(
        UserInfo(
            user_id=token_info["email"],
            data_clearance=token_info["sofi-data-clearance"],
            institution=token_info["institution"],
            groups=groups,
            permissions=list_permissions(token_info),
        )
    )


def get_user_views(user, token_info):
    return jsonify(get_views(user))


def create_user_view(user, token_info, body: UserDefinedView):
    res = create_view(user, body)
    return jsonify(body) if res.inserted_id != None else abort(400)


def delete_view(user, token_info, name: str):
    res = remove_view(user, name)
    return None if res.deleted_count > 0 else abort(404)
