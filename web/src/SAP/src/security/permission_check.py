import json
import os
import sys
from typing import Any, Dict, List, Union

import commentjson
from flask_jwt_extended import decode_token
from hkdf import Hkdf
from jose.jwe import decrypt
from keycloak import KeycloakAdmin
from werkzeug.exceptions import Forbidden

from ...common.config.column_config import columns, gen_default_column

PERMISSION_CONFIG: Union[Dict[str, List[str]], None] = None
with open(os.getcwd() + "/permission-config.jsonc", encoding="utf-8") as js_file:
    PERMISSION_CONFIG = commentjson.loads(js_file.read())

MICROREACT_ENCRYPTION_SECRET = os.environ.get(
    "MICROREACT_ENCRYPTION_SECRET"
)
KEYCLOAK_ADMIN_USER = os.environ.get("KEYCLOAK_ADMIN_USER")
KEYCLOAK_ADMIN_PASSWORD = os.environ.get("KEYCLOAK_ADMIN_PASSWORD")
KEYCLOAK_URL = os.environ.get("KEYCLOAK_URL")


def list_permissions(token_info: Dict[str, str]) -> List[str]:
    permissions: List[str] = []
    if PERMISSION_CONFIG is None:
        return permissions

    if not "security-groups" in token_info:
        return permissions

    for group in [item.lstrip("/") for item in token_info["security-groups"]]:
        for perm in PERMISSION_CONFIG[group]:
            permissions.append(perm)
    return permissions


def user_has(permission: str, token_info: Dict[str, str]) -> bool:
    if PERMISSION_CONFIG is None:
        return False

    if not "security-groups" in token_info:
        return False

    for group in [item.lstrip("/") for item in token_info["security-groups"]]:
        for perm in PERMISSION_CONFIG[group]:
            if perm == permission:
                return True
    return False


def assert_user_has(permission: str, token_info: Dict[str, str]):
    if not user_has(permission, token_info):
        raise Forbidden(f"You lack -{permission}- permission")


def authorized_to_edit(token_info: Dict[str, str], metadata: Dict[str, Any], changed_columns: List[str] = []) -> bool:
    # User must have the approve claim to do modifications
    if not user_has("approve", token_info):
        return False
    # I no institution, allow
    if not "institution" in metadata:
        return True
    # When user's not from the same institution as the sample
    if token_info["institution"] == metadata["institution"]:
        return True
    # if User has data_clearence cross-institution and changed_columns are all cross-org editable
    cols = columns()
    cross_org_editable = list(map(lambda c: c["field_name"], filter(lambda c: c["cross_org_editable"], cols)))
    if token_info["sofi-data-clearance"] == "cross-institution":
        if all(col in cross_org_editable for col in changed_columns):
            return True
    # User needs 'L2' or higher clearance to modify data
    if token_info["sofi-data-clearance"] == "all":
        return True
    # Default to false
    return False


def assert_authorized_to_edit(token_info: Dict[str, str], metadata: Dict[str, Any], changed_columns: List[str] = []):
    if not authorized_to_edit(token_info, metadata, changed_columns):
        isolate_id = metadata["isolate_id"]
        raise Forbidden(f"You are not authorized to edit isolate -{isolate_id}-")


def authorized_columns(token_info: Dict[str, Any], onlyEditable: bool = False) -> List[str]:
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
                    lambda c: (not onlyEditable or c["editable"]) and (not c["pii"] or institution in c["organizations"] or c["cross_org_editable"]), cols
                ),
            )
        )

    if data_clearance == "all":
        # User has access to all columns, return all field names
        return list(map(lambda c: c["field_name"], cols))

    # User has not been granted a sofi-data-clearance claim that we recognize 
    return []


def decode_sofi_token(token: str, name: str):
    if name == "microreactjwt":
        if MICROREACT_ENCRYPTION_SECRET is None:
            raise Exception(
                "Missing environment variable: MICROREACT_ENCRYPTION_SECRET"
            )

        obj = decode_jwe(token, MICROREACT_ENCRYPTION_SECRET)
        if obj == None:
            return None

        return get_user_info_from_keycloak(obj)

    else:
        return decode_token(token)


def __encryption_key(secret: str):
    return Hkdf("", bytes(secret, "utf-8")).expand(
        b"NextAuth.js Generated Encryption Key", 32
    )


def decode_jwe(token: str, secret: str):
    decrypted = decrypt(token, __encryption_key(secret))

    if decrypted:
        return json.loads(bytes.decode(decrypted, "utf-8"))
    else:
        return None


def get_user_info_from_keycloak(token: dict):
    if KEYCLOAK_ADMIN_USER is None or KEYCLOAK_ADMIN_PASSWORD is None:
        raise Exception(
            "Missing environment variable: KEYCLOAK_ADMIN_USER or KEYCLOAK_ADMIN_PASSWORD"
        )

    username = token["email"]

    keycloak = KeycloakAdmin(
        server_url=f"{KEYCLOAK_URL}/auth/",
        username=KEYCLOAK_ADMIN_USER,
        password=KEYCLOAK_ADMIN_PASSWORD,
        realm_name="sofi",
        user_realm_name="master",
    )

    user_id = keycloak.get_user_id(username)
    user = keycloak.get_user(user_id)
    groups = keycloak.get_user_groups(user_id)

    return {
        "exp": token["exp"],
        "iat": token["iat"],
        "auth_time": token["iat"],
        "jti": token["jti"],
        "iss": f"{KEYCLOAK_URL}/auth/realms/sofi",
        "aud": "SOFI_APP",
        "sub": user["id"],
        "typ": "ID",
        "azp": "SOFI_APP",
        "institution": user["attributes"]["institution"][0],
        "email_verified": user["emailVerified"],
        "security-groups": list(map(lambda x: x["path"], groups)),
        "sofi-data-clearance": user["attributes"]["sofi-data-clearance"][0],
        "preferred_username": user["username"],
        "email": user["email"],
        "type": "access",
        "fresh": False,
    }
