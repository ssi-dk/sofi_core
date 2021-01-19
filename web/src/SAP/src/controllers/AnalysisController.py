import os
import logging
import base64
import json
import commentjson
from bson.json_util import dumps
from flask.json import jsonify
from ..repositories.analysis import get_analysis_page, get_analysis_count, update_analysis, get_single_analysis
from web.src.SAP.generated.models import AnalysisResult
from web.src.SAP.generated.models import Column

def parse_paging_token(token):
    if token:
        body = base64.b64decode(token)
        return json.load(body)
    else:
        return None

def render_paging_token(page_size, query, offset):
    body = { "page_size": int(page_size), "query": query, "offset": int(offset) }
    return str(base64.b64encode(json.dumps(body).encode('utf8')), encoding="utf8")

def get_analysis(paging_token, page_size):
    # TODO: filter on user claims
    default_token = { "page_size": page_size or 100, "offset": 0}
    token = parse_paging_token(paging_token) or default_token
    items = get_analysis_page({}, token['page_size'], token['offset'])
    count = get_analysis_count({})
    new_token = render_paging_token(token['page_size'], {}, token['offset'] + token['page_size'])
    response = {"items": items, "paging_token": new_token, "total_count": count, "approval_matrix": {}}
    return jsonify(response)

def search_analysis(query):
    # TODO: filter on user claims
    default_token = { "page_size": query.page_size or 100, "offset": 0, "query": query.filters}
    token = parse_paging_token(query.paging_token) or default_token
    items = get_analysis_page(token['query'], token['page_size'], token['offset'])
    count = get_analysis_count(token['query'])
    new_token = render_paging_token(token['page_size'], token['query'], token['offset'] + token['page_size'])
    response = {"items": items, "paging_token": new_token, "total_count": count, "approval_matrix": {}}
    return jsonify(response)

def submit_changes(body):
    updates = map(lambda x: x, body.keys())
    # TODO: Verify user is allowed to modify these keys
    update_analysis(body)
    res = dict()
    for u in updates:
        res[u] = get_single_analysis(u)
    return jsonify(res)

def gen_default_column(field_name):
    return Column(approvable=False,
                  editable=False,
                  pii=False,
                  organizations=["FVST", "SSI"],
                  field_name=field_name,
                  approves_with=[])

def get_columns():
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

