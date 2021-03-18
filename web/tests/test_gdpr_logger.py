from typing import List
from pprint import pprint
from web.src.SAP.generated.models.analysis_result import AnalysisResult
from web.src.SAP.src.security.gdpr_logger import (
    gdpr_sensitive_columns,
    query_requires_audit,
)


def test_gdpr_logger_recognizes_sensitive_columns():
    cols = gdpr_sensitive_columns()
    pprint(list(cols))

    assert "cpr_nr" in cols
    assert "cvr_number" in cols
    assert "chr_number" in cols
    assert "aut_number" in cols
    assert "name" in cols
    assert "provided_species" not in cols


def test_gdpr_logger_audits_sensitive_queries():
    expected_id = "sensitive"
    unexpected_id = "not"
    results: List[AnalysisResult] = [
        AnalysisResult(isolate_id=expected_id, cpr_nr="010151111"),
        AnalysisResult(isolate_id=unexpected_id),
    ]
    isolates = query_requires_audit(results)
    assert len(isolates) == 1
    assert isolates[0].isolate_id == expected_id
