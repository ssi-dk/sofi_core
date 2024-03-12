import os
from typing import Any, Dict
import commentjson
from flask import current_app as app
from werkzeug.exceptions import Forbidden
from web.src.SAP.common.config.column_config import columns

PERMISSION_CONFIG = None
with open(os.getcwd() + "/permission-config.jsonc") as js_file:
    PERMISSION_CONFIG = commentjson.loads(js_file.read())


def list_permissions(token_info: Dict[str, str]):
    list = []
    for group in token_info["security-groups"]:
        for perm in PERMISSION_CONFIG[group]:
            list.append(perm)
    return list


def user_has(permission: str, token_info: Dict[str, str]):
    for group in token_info["security-groups"]:
        for perm in PERMISSION_CONFIG[group]:
            if perm == permission:
                return True
    return False


def assert_user_has(permission: str, token_info: Dict[str, str]):
    if not user_has(permission, token_info):
        raise Forbidden(f"You lack -{permission}- permission")


def authorized_to_edit(token_info: Dict[str, str], metadata: Dict[str, Any]):
    # User must have the approve claim to do modifications
    if not user_has("approve", token_info):
        return False
    # When user's not from the same institution as the sample, they can't modify it
    if not token_info["institution"] == metadata["institution"]:
        return False
    # User needs 'L2' or higher clearance to modify data
    if token_info["sofi-data-clearance"] == "all":
        return True
    if token_info["sofi-data-clearance"] == "cross-institution":
        return True
    # Default to false
    return False


def assert_authorized_to_edit(token_info: Dict[str, str], metadata: Dict[str, Any]):
    if not authorized_to_edit(token_info, metadata):
        theId = metadata["isolate_id"]
        raise Forbidden(f"You are not authorized to edit isolate -{theId}-")


def authorized_columns(token_info: Dict[str, Any]):
    data_clearance = token_info["sofi-data-clearance"]
    cols = columns()
    institution = token_info["institution"]
    if data_clearance == "own-institution":
        # User only has access to their institution's data, so filter off that
        return list(
            map(
                lambda c: c["field_name"],
                filter(lambda c: institution in c["organizations"], cols),
            )
        )

    if data_clearance == "cross-institution":
        # User has access to their institution's data, plus non-pii data of other institutions
        return list(
            map(
                lambda c: c["field_name"],
                filter(
                    lambda c: not c["pii"] or institution in c["organizations"], cols
                ),
            )
        )

    if data_clearance == "all":
        # User has access to all columns, return all field names
        return list(map(lambda c: c["field_name"], cols))

    # User has not been granted a sofi-data-clearance claim that we recognize
    return []
