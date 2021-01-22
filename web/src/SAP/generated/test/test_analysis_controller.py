# coding: utf-8

import unittest

from flask import json
from six import BytesIO

from web.src.SAP.generated.models.analysis_query import AnalysisQuery  # noqa: E501
from web.src.SAP.generated.models.column import Column  # noqa: E501
from web.src.SAP.generated.models.page_of_analysis import PageOfAnalysis  # noqa: E501
from .test import BaseTestCase


class TestAnalysisController(BaseTestCase):
    """AnalysisController integration test stubs"""

    def test_get_analysis(self):
        """Test case for get_analysis

        
        """
        query_string = [('paging_token', None),
                        ('page_size', 100)]
        headers = { 
            'Accept': 'application/json',
            'Authorization': 'Bearer special-key',
        }
        response = self.client.open(
            '/api/analysis',
            method='GET',
            headers=headers,
            query_string=query_string)
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_get_columns(self):
        """Test case for get_columns

        
        """
        headers = { 
            'Accept': 'application/json',
            'Authorization': 'Bearer special-key',
        }
        response = self.client.open(
            '/api/analysis/columns',
            method='GET',
            headers=headers)
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_search_analysis(self):
        """Test case for search_analysis

        
        """
        query = {
  "paging_token" : "paging_token",
  "filters" : {
    "key" : "filters"
  },
  "page_size" : 0
}
        headers = { 
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer special-key',
        }
        response = self.client.open(
            '/api/analysis',
            method='POST',
            headers=headers,
            data=json.dumps(query),
            content_type='application/json')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_submit_changes(self):
        """Test case for submit_changes

        
        """
        body = None
        headers = { 
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer special-key',
        }
        response = self.client.open(
            '/api/analysis/changes',
            method='POST',
            headers=headers,
            data=json.dumps(body),
            content_type='application/json')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))


if __name__ == '__main__':
    unittest.main()
