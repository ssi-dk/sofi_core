from typing import Dict, List
import functools
from flask import current_app as app
from web.src.SAP.common.config.column_config import columns
from web.src.SAP.generated.models import AnalysisResult


@functools.lru_cache(maxsize=1)
def gdpr_sensitive_columns():
    cols = columns()
    return list(
        map(lambda x: x["field_name"], filter(lambda y: y["gdpr"] == True, cols))
    )


def query_requires_audit(result: List[AnalysisResult]):
    audited_isolates = []
    for item in result:
        for sensitive in gdpr_sensitive_columns():
            if isinstance(item, dict):
                if sensitive in item:
                    audited_isolates.append(item)
            else:
                if getattr(item, sensitive):
                    audited_isolates.append(item)

    return audited_isolates


def audit_query(token_info: Dict[str, str], result: List[AnalysisResult]):
    isolates = list(
        map(
            lambda x: x["isolate_id"]
            if isinstance(x, dict)
            else getattr(x, "isolate_id"),
            query_requires_audit(result),
        )
    )
    if len(isolates) > 0:
        email = token_info["email"]
        app.logger.info(
            f"[GDPR Audit]: User -{email}- accessed GDPR-protected columns in isolates: {isolates}"
        )
