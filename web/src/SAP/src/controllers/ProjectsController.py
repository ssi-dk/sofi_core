
import sys

from flask import jsonify

from web.src.SAP.src.repositories.projects import get_projects as db_get_projects, set_is_private as db_set_is_private
from web.src.SAP.src.security.permission_check import assert_user_has, list_permissions

def get_projects(user, token_info):
    assert_user_has("projects.manage",token_info)

    return jsonify(db_get_projects(token_info["institution"]))


def set_is_private(user,token_info, project_key: str,is_private: bool):
    assert_user_has("projects.manage",token_info)
    db_set_is_private(project_key,token_info["institution"],is_private)
    
