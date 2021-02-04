import os
import commentjson
from flask import current_app as app
from werkzeug.exceptions import Forbidden
from web.src.SAP.src.config.column_config import columns

PERMISSION_CONFIG = None
with open(os.getcwd() + '/permission-config.jsonc') as js_file:
    PERMISSION_CONFIG = commentjson.loads(js_file.read())

def list_permissions(token_info):
    list = []
    for group in token_info['security-groups']:
        for perm in PERMISSION_CONFIG[group]:
            list.append(perm)
    return list

def user_has(permission, token_info):
    for group in token_info['security-groups']:
        for perm in PERMISSION_CONFIG[group]:
            if perm == permission:
                return True
    return False

def assert_user_has(permission, token_info):
    if not user_has(permission, token_info):
        raise Forbidden(f'You lack -{permission}- permission')

def authorized_columns(token_info):
    data_clearance = token_info['sofi-data-clearance']
    cols = columns()
    institution = token_info['institution']
    if data_clearance == "own-institution":
        # User only has access to their institution's data, so filter off that
        return list(map(
                   lambda c: c['field_name'],
                   filter(lambda c: institution in c['organizations'],
                          cols)))

    if data_clearance == "cross-institution":
        # User has access to their institution's data, plus non-pii data of other institutions
        return list(map(
                   lambda c: c['field_name'],
                   filter(lambda c: not c['pii'] or institution in c['organizations'],
                          cols)))

    if data_clearance == "all":
        # User has access to all columns, return all field names
        return list(map(lambda c: c['field_name'], cols))

    # User has not been granted a sofi-data-clearance claim that we recognize
    return []