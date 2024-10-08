import os
from typing import Any, Dict, List, Union
import commentjson
from werkzeug.exceptions import Forbidden
from ...common.config.column_config import columns

PERMISSION_CONFIG: Union[Dict[str, List[str]], None] = None
with open(os.getcwd() + "/permission-config.jsonc", encoding="utf-8") as js_file:
    PERMISSION_CONFIG = commentjson.loads(js_file.read())


def list_permissions(token_info: Dict[str, str]) -> List[str]:
    permissions: List[str] = []
    if PERMISSION_CONFIG is None:
        return permissions

    if not "security-groups" in token_info:
        return permissions

    for group in [item.lstrip('/') for item in token_info["security-groups"]]:
        for perm in PERMISSION_CONFIG[group]:
            permissions.append(perm)
    return permissions

def user_has(permission: str, token_info: Dict[str, str]) -> bool:
    if PERMISSION_CONFIG is None:
        return False

    if not "security-groups" in token_info:
        return False

    for group in [item.lstrip('/') for item in token_info["security-groups"]]:
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
    # I no institution, allow
    if not "institution" in metadata:
        return True
    # When user's not from the same institution as the sample, they can't modify it
    if token_info["institution"] == metadata["institution"]:
        return True
    # User needs 'L2' or higher clearance to modify data
    if token_info["sofi-data-clearance"] == "all":
        return True
    # Default to false
    return False


def assert_authorized_to_edit(token_info: Dict[str, str], metadata: Dict[str, Any]):
    if not authorized_to_edit(token_info, metadata):
        isolate_id = metadata["isolate_id"]
        raise Forbidden(f"You are not authorized to edit isolate -{isolate_id}-")


def authorized_columns(token_info: Dict[str, Any]) -> List[str]:
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
