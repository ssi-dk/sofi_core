import os
import commentjson
import functools
from web.src.SAP.generated.models import AnalysisResult
from web.src.SAP.generated.models import Column

COLUMN_CONFIG = None
with open(os.getcwd() + '/column-config.jsonc') as js_file:
    COLUMN_CONFIG = commentjson.loads(js_file.read())

def gen_default_column(field_name):
    return { 'approvable': False,
             'editable': False,
             'pii': False,
             'organizations': ["FVST", "SSI"],
             'field_name': field_name,
             'approves_with': [] }

@functools.lru_cache(maxsize=1)
def columns():
    analysis = AnalysisResult()
    cols={}
    # build up dictionary of default configs
    for attr, _ in analysis.openapi_types.items():
        cols.update({attr: gen_default_column(attr)})
    # apply configuration file on top
    with open(os.getcwd() + '/column-config.jsonc') as js_file:
        config = commentjson.loads(js_file.read()) 
        for c in config:
            cols.update({c['field_name']: {**cols[c['field_name']], **c}})
        return list(cols.values())
