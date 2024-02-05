from flask import abort
from flask.json import jsonify
from web.src.SAP.generated.models import UserDefinedView, UserInfo
from ..repositories.views import get_views, remove_view, create_view
from web.src.SAP.src.security.permission_check import list_permissions


def who_am_i(user, token_info):
    return jsonify(
        UserInfo(
            user_id=token_info["email"],
            data_clearance=token_info["sofi-data-clearance"],
            institution=token_info["institution"],
            groups=token_info["security-groups"],
            permissions=list_permissions(token_info),
        )
    )


def get_user_views(user, token_info):
    return jsonify(get_views(user))


def create_user_view(user, token_info, body: UserDefinedView):
    views = get_views(user)
    print("Print views: ", views)

    name_already_exists = any(view.get("name") == body.name for view in views)
    print("Match found: ", name_already_exists)

    if name_already_exists:
        pattern = f"{body.name}_"
        matching_views = [
            view for view in views if view.get("name", "").startswith(pattern)
        ]

        numbers = []
        for view in matching_views:
            try:
                number = int(view.get("name", "")[len(pattern) :])
                numbers.append(number)
            except ValueError:
                continue

        next_number = max(numbers, default=0) + 1
        body.name += f"_{next_number}"

    print("New unique name: ", body.name)

    res = create_view(user, body)
    return jsonify(body) if res.inserted_id != None else abort(400)


def delete_view(user, token_info, name: str):
    res = remove_view(user, name)
    return None if res.deleted_count > 0 else abort(404)
