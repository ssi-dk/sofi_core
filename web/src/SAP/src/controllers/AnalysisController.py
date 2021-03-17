import base64
import json
from ...generated.models.organization import Organization
from web.src.SAP.src.security.gdpr_logger import audit_query
from flask.json import jsonify
from ..repositories.analysis import (
    get_analysis_page,
    get_analysis_count,
    update_analysis,
    get_single_analysis,
)
from web.src.SAP.src.security.permission_check import (
    assert_user_has,
    authorized_columns,
)
from web.src.SAP.common.config.column_config import columns
from ..services.queue_service import post_and_await_reload


def parse_paging_token(token):
    if token:
        body = base64.b64decode(token)
        return json.load(body)
    else:
        return None


def render_paging_token(page_size, query, offset):
    body = {"page_size": int(page_size), "query": query, "offset": int(offset)}
    return str(base64.b64encode(json.dumps(body).encode("utf8")), encoding="utf8")


def get_analysis(user, token_info, paging_token, page_size):
    # TODO: filter on user claims
    default_token = {"page_size": page_size or 100, "offset": 0}
    token = parse_paging_token(paging_token) or default_token
    items = get_analysis_page({}, token["page_size"], token["offset"])
    count = get_analysis_count({})
    new_token = render_paging_token(
        token["page_size"], {}, token["offset"] + token["page_size"]
    )
    response = {
        "items": items,
        "paging_token": new_token,
        "total_count": count,
        "approval_matrix": {},
    }
    audit_query(token_info, items)
    return jsonify(response)

def reload_metadata(user, token_info, body):
    if body.institution:
        if body.institution == Organization.OTHER:
            return {}
        else:
            return post_and_await_reload(body.isolate_id, body.institution)
    return {}

def search_analysis(user, token_info, query):
    assert_user_has("search", token_info)
    # TODO: filter on user claims
    default_token = {
        "page_size": query.page_size or 100,
        "offset": 0,
        "query": query.filters,
    }
    token = parse_paging_token(query.paging_token) or default_token
    items = get_analysis_page(token["query"], token["page_size"], token["offset"])
    count = get_analysis_count(token["query"])
    new_token = render_paging_token(
        token["page_size"], token["query"], token["offset"] + token["page_size"]
    )
    response = {
        "items": items,
        "paging_token": new_token,
        "total_count": count,
        "approval_matrix": {},
    }
    audit_query(token_info, items)
    return jsonify(response)


def submit_changes(user, token_info, body):
    assert_user_has("approve", token_info)
    updates = map(lambda x: x, body.keys())
    # TODO: Verify user is allowed to modify these keys
    # TODO: Verify that none of these cells are already approved
    update_analysis(body)
    res = dict()
    for u in updates:
        res[u] = get_single_analysis(u)
    return jsonify(res)


def get_columns(user, token_info):
    authorized = authorized_columns(token_info)
    return jsonify(list(filter(lambda c: c["field_name"] in authorized, columns())))
