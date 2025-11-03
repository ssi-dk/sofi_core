import base64
import json
import sys
from datetime import datetime
from flask import abort
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
    get_analysis_with_metadata,
    update_analysis,
    get_single_analysis,
    get_filter_metadata,
)
from web.src.SAP.src.security.permission_check import (
    assert_authorized_to_edit,
    assert_user_has,
    authorized_columns,
)
from web.src.SAP.common.config.column_config import columns
from ..services.queue_service import post_and_await_reload
from ..services.search.transpiler import AbstractSyntaxTreeVisitor

    
def serialize_query_for_json(query):
    if isinstance(query, dict):
        return {k: serialize_query_for_json(v) for k, v in query.items()}
    elif isinstance(query, list):
        return [serialize_query_for_json(item) for item in query]
    elif isinstance(query, datetime):
        return query.isoformat()
    else:
        return query

def deserialize_query(query):
    if isinstance(query, dict):
        return {k: deserialize_query(v) for k, v in query.items()}
    elif isinstance(query, list):
        return [deserialize_query(item) for item in query]
    elif isinstance(query, str):
        try:
            return datetime.fromisoformat(query)
        except ValueError:
            return query
    else:
        return query

def parse_paging_token(token):
    if token:
        body = base64.b64decode(token)
        parsed = json.loads(body)
        deserialized_parsed = deserialize_query(parsed)
        return deserialized_parsed
    else:
        return None

def render_paging_token(page_size, query, offset):
    query = serialize_query_for_json(query)
    body = {"page_size": int(page_size), "query": query, "offset": int(offset)}
    return str(base64.b64encode(json.dumps(body).encode("utf8")), encoding="utf8")


def get_sequence_by_id(user, token_info, sequence_id):
    assert_user_has("search", token_info)
    row = get_analysis_with_metadata(sequence_id)
    if row is None:
        abort(404)
    if (
        token_info["sofi-data-clearance"] == "own-institution"
        and token_info["institution"] != row["institution"]
    ):
        abort(404)
    allowed_cols = authorized_columns(token_info)
    for key, _ in list(row.items()):
        # Only return columns user is allowed to see
        if not key in allowed_cols:
            del row[key]
    return jsonify(row)

def get_analysis_history(user, token_info, isolate_id):
    items = get_analysis_page(
        {"isolate_id": isolate_id},
        1000,
        0,
        authorized_columns(token_info),
        token_info["institution"],
        token_info["sofi-data-clearance"],
        False,
    )
    response = {
        "items": items,
    }
    audit_query(token_info, items)
    return jsonify(response)

def get_analysis(user, token_info, paging_token, page_size):
    assert_user_has("search", token_info)
    default_token = {"page_size": page_size or 100, "offset": 0}
    token = parse_paging_token(paging_token) or default_token
    
    items = get_analysis_page(
        token.get("query", {}),
        token["page_size"],
        token["offset"],
        authorized_columns(token_info),
        token_info["institution"],
        token_info["sofi-data-clearance"]
    )
    count = get_analysis_count(token.get("query", {}), token_info["institution"], token_info["sofi-data-clearance"])

    filter_metadata = get_filter_metadata(
        authorized_columns(token_info),
        token_info["institution"],
        token_info["sofi-data-clearance"]
    )

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
        "filter_options": {
            "date_sample": {
                "min": filter_metadata.get("min_date_sample"),
                "max": filter_metadata.get("max_date_sample")
            },
            "date_received": {
                "min": filter_metadata.get("min_date_received"),
                "max": filter_metadata.get("max_date_received")
            },
            "institutions": filter_metadata.get("institutions", []),
            "project_titles": filter_metadata.get("project_titles", []),
            "project_numbers": filter_metadata.get("project_numbers", []),
            "animals": filter_metadata.get("animals", []),
            "run_ids": filter_metadata.get("run_ids", []),
            "isolate_ids": filter_metadata.get("isolate_ids", []),
            "fud_nos": filter_metadata.get("fud_nos", []),
            "cluster_ids": filter_metadata.get("cluster_ids", []),
            "qc_provided_species": filter_metadata.get("qc_provided_species", []),
            "serotype_finals": filter_metadata.get("serotype_finals", []),
            "st_finals": filter_metadata.get("st_finals", [])
        }
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
    items = get_analysis_page(
        token["query"],
        token["page_size"],
        token["offset"],
        authorized_columns(token_info),
        token_info["institution"],
        token_info["sofi-data-clearance"],
    )

    count = get_analysis_count(token["query"], token_info["institution"], token_info["sofi-data-clearance"])
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
    allowed_cols = authorized_columns(token_info, True)
    for identifier in updates:
        row = get_single_analysis(identifier)
        # Make sure user is allowed to modify this row
        assert_authorized_to_edit(token_info, row, body[identifier].keys())
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
