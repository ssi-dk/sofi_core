from ..repositories.analysis import get_all_analysis
from bson.json_util import dumps
from web.src.SAP.generated.models import Analysis
from flask.json import jsonify
import json


def get_analysis(paging_token, page_size):  # noqa: E501
    return jsonify(get_all_analysis())
