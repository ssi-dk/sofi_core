import base64
import json
import sys
from typing import Any, Dict
from web.src.SAP.generated.models.analysis_query import AnalysisQuery
from werkzeug.exceptions import Forbidden
from flask import current_app as app
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
    assert_authorized_to_edit,
    assert_user_has,
    authorized_columns,
)
from web.src.SAP.common.config.column_config import columns
from ..services.queue_service import post_and_await_reload
from ..services.search.transpiler import AbstractSyntaxTreeVisitor


def parse_paging_token(token):
    if token:
        body = base64.b64decode(token)
        return json.loads(body)
    else:
        return None


def render_paging_token(page_size, query, offset):
    body = {"page_size": int(page_size), "query": query, "offset": int(offset)}
    return str(base64.b64encode(json.dumps(body).encode("utf8")), encoding="utf8")


def get_analysis(user, token_info, paging_token, page_size):
    assert_user_has("search", token_info)
    default_token = {"page_size": page_size or 100, "offset": 0}
    token = parse_paging_token(paging_token) or default_token
    # If user has 'own-institution' clearance, pass an implicit filter to the query
    institution_filter = (
        token_info["institution"]
        if token_info["sofi-data-clearance"] == "own-institution"
        else False
    )
    items = get_analysis_page(
        token.get("query", {}),
        token["page_size"],
        token["offset"],
        authorized_columns(token_info),
        institution_filter,
    )
    count = get_analysis_count({})
    new_token = (
        None
        if len(items) < token["page_size"]
        else render_paging_token(
            token["page_size"],
            token.get("query", {}),
            token["offset"] + token["page_size"],
        )
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


def search_analysis(user, token_info, query: AnalysisQuery):
    visitor = AbstractSyntaxTreeVisitor()
    expr_empty = (
        query.expression is None
        or query.expression.__dict__.get("_left", None) is None
        and query.expression.__dict__.get("_operator", None) is None
    )
    default_token = {
        "page_size": query.page_size or 1000,
        "offset": 0,
        "query": visitor.visit(query.expression)
        if not expr_empty
        else (query.filters if not None else {}),
    }

    token = parse_paging_token(query.paging_token) or default_token
    # If user has 'own-institution' clearance, pass an implicit filter to the query
    institution_filter = (
        token_info["institution"]
        if token_info["sofi-data-clearance"] == "own-institution"
        else False
    )

    items = get_analysis_page(
        token["query"],
        token["page_size"],
        token["offset"],
        authorized_columns(token_info),
        institution_filter,
    )
    count = get_analysis_count(token["query"])
    new_token = (
        None
        if len(items) < token["page_size"]
        else render_paging_token(
            token["page_size"], token["query"], token["offset"] + token["page_size"]
        )
    )
    response = {
        "items": items,
        "paging_token": new_token,
        "total_count": count,
        "approval_matrix": {},
    }
    audit_query(token_info, items)
    return jsonify(response)


def submit_changes(
    user, token_info: Dict[str, str], body: Dict[str, Any]
) -> Dict[str, Dict[str, Any]]:
    assert_user_has("approve", token_info)
    updates = list(map(lambda x: x, body.keys()))
    allowed_cols = authorized_columns(token_info)
    for identifier in updates:
        row = get_single_analysis(identifier)
        # Make sure user is allowed to modify this row
        assert_authorized_to_edit(token_info, row)
        for col in body[identifier].keys():
            # Make sure is allowed to modify that column
            if not col in allowed_cols:
                raise Forbidden(f"You are not authorized to edit column -{col}-")
    # TODO: Verify that none of these cells are already approved
    update_analysis(body)
    res = dict()
    for u in updates:
        res[u] = get_single_analysis(u)
    return jsonify(res)


def get_columns(user, token_info):
    authorized = authorized_columns(token_info)
    return jsonify(list(filter(lambda c: c["field_name"] in authorized, columns())))
