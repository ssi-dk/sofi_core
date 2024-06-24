import sys
from flask import abort
from flask.json import jsonify
from web.src.SAP.src.repositories.samples import get_single_sample
from web.src.SAP.src.security.permission_check import assert_user_has
from bson import json_util
import json

def get_sample_by_id(user, token_info, sample_id):
    assert_user_has("search", token_info)

    row = get_single_sample(sample_id)
    if row is None:
        abort(404)
    if (
        token_info["sofi-data-clearance"] == "own-institution"
        and token_info["institution"] != row["categories"]["sample_info"]["summary"]["institution"]
    ):
        abort(404)

    # Note: dump to serialize ObjectId
    return json.loads(json_util.dumps(row)), 200
    