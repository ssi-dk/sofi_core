import os
from typing import Dict, List, Union
import commentjson
import functools

try:
    from web.src.SAP.generated.models import AnalysisResult
    from web.src.SAP.generated.models import Column
except:
    pass

PATH = os.path.dirname(os.path.realpath(__file__))

COLUMN_CONFIG = None
with open(PATH + "/column-config.jsonc") as js_file:
    COLUMN_CONFIG = commentjson.loads(js_file.read())

ColumnDict = Dict[str, Union[bool, List[str], str]]


def gen_default_column(field_name: str) -> ColumnDict:
    return {
        "id": "",
        "approvable": False,
        "internal_approval_only": False,
        "editable": False,
        "editable_format": None,
        "pii": False,
        "gdpr": False,
        "computed": False,
        "organizations": ["FVST", "SSI"],
        "field_name": field_name,
        "approves_with": [],
    }


@functools.lru_cache(maxsize=1)
def columns() -> List[Dict[str, str]]:
    analysis = AnalysisResult()
    cols: Dict[str, ColumnDict] = {}
    # build up dictionary of default configs
    openapi_columns = analysis.openapi_types.items()
    for attr, _ in openapi_columns:
        if attr == "id":
            continue
        cols.update({attr: gen_default_column(attr)})
    # apply configuration file on top
    with open(PATH + "/column-config.jsonc") as js_file:
        config: List[ColumnDict] = commentjson.loads(js_file.read())
        for c in config:
            cols.update({c["field_name"]: {**cols[c["field_name"]], **c}})
        return list(cols.values())


@functools.lru_cache(maxsize=1)
def internal_approval_fields() -> List[str]:
    return [
        x["field_name"] for x in COLUMN_CONFIG if x.get("internal_approval_only", False)
    ]


@functools.lru_cache(maxsize=1)
def pii_columns() -> List[str]:
    return [x["field_name"] for x in COLUMN_CONFIG if x.get("pii", False)]
