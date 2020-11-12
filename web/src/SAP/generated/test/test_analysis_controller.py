# coding: utf-8

import unittest

from flask import json
from six import BytesIO

from web.src.SAP.generated.models.page_of_analysis import PageOfAnalysis  # noqa: E501
from .test import BaseTestCase


class TestAnalysisController(BaseTestCase):
    """AnalysisController integration test stubs"""

    def test_get_analysis(self):
        """Test case for get_analysis"""
        query_string = [("pagingToken", None), ("pageSize", 100)]
        headers = {
            "Accept": "application/json",
        }
        response = self.client.open(
            "/api/analysis", method="GET", headers=headers, query_string=query_string
        )
        self.assert200(response, "Response body is : " + response.data.decode("utf-8"))


if __name__ == "__main__":
    unittest.main()
