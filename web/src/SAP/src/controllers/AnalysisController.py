import os
import json
import commentjson
from bson.json_util import dumps
from flask.json import jsonify
from ..repositories.analysis import get_all_analysis
from web.src.SAP.generated.models import AnalysisResult
from web.src.SAP.generated.models import Column

def get_analysis(paging_token, page_size):  # noqa: E501
    return jsonify(get_all_analysis())

def gen_default_column(field_name):
    return Column(approvable=False,
                  editable=False,
                  pii=False,
                  organizations=["FVST", "SSI"],
                  field_name=field_name,
                  approves_with=[])

def get_columns(): # noqa: E501
    analysis = AnalysisResult()
    cols={}
    # build up dictionary of default configs
    for attr, _ in analysis.openapi_types.items():
        cols.update({attr: gen_default_column(attr)})
    # apply configuration file on top
    with open(os.getcwd() + '/column-config.jsonc') as js_file:
        config = commentjson.loads(js_file.read()) 
        # TODO: trim column info to those columns user is authorized for
        for c in config:
            cols.update({c['field_name']: c})
        return list(cols.values())

