
from flask import jsonify

from web.src.SAP.src.repositories.projects import get_projects as db_get_projects, set_is_private as db_set_is_private

def get_projects(user, token_info):

    return jsonify(db_get_projects(token_info["institution"]))


def set_is_private(user,token_info, project_key: str,is_private: bool):
    db_set_is_private(project_key,token_info["institution"],is_private)
    
