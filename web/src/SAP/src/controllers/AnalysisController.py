import os
import json
import commentjson
from bson.json_util import dumps
from flask.json import jsonify
from ..repositories.analysis import get_all_analysis
from web.src.SAP.generated.models import Analysis

def get_analysis(paging_token, page_size):  # noqa: E501
    return jsonify(get_all_analysis())

def get_columns(): # noqa: E501
    # TODO: trim column info to those columns authorized user is allowed to see
    with open(os.getcwd() + '/column-config.jsonc') as js_file:
        return commentjson.loads(js_file.read())
