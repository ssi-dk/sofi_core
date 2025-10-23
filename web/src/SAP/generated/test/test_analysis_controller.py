# coding: utf-8

import unittest

from flask import json
from six import BytesIO

from web.src.SAP.generated.models.analysis_history import AnalysisHistory  # noqa: E501
from web.src.SAP.generated.models.analysis_query import AnalysisQuery  # noqa: E501
from web.src.SAP.generated.models.analysis_result import AnalysisResult  # noqa: E501
from web.src.SAP.generated.models.analysis_sorting import AnalysisSorting  # noqa: E501
from web.src.SAP.generated.models.column import Column  # noqa: E501
from web.src.SAP.generated.models.metadata_reload_request import MetadataReloadRequest  # noqa: E501
from web.src.SAP.generated.models.metadata_reload_response import MetadataReloadResponse  # noqa: E501
from web.src.SAP.generated.models.page_of_analysis import PageOfAnalysis  # noqa: E501
from .test import BaseTestCase


class TestAnalysisController(BaseTestCase):
    """AnalysisController integration test stubs"""

    def test_get_analysis(self):
        """Test case for get_analysis

        
        """
        query_string = [('paging_token', None)
                        ('page_size', 100)
                        ('analysis_sorting', {})]
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

    def test_get_analysis_history(self):
        """Test case for get_analysis_history

        
        """
        headers = { 
            'Accept': 'application/json',
            'Authorization': 'Bearer special-key',
        }
        response = self.client.open(
            '/api/analysis-history/{isolate_id}'.format(isolate_id='isolate_id_example'),
            method='GET',
            headers=headers)
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

    def test_get_sequence_by_id(self):
        """Test case for get_sequence_by_id

        
        """
        query_string = [('sequence_id', 'sequence_id_example')]
        headers = { 
            'Accept': 'application/json',
            'Authorization': 'Bearer special-key',
        }
        response = self.client.open(
            '/api/analysis/by_id',
            method='GET',
            headers=headers,
            query_string=query_string)
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_reload_metadata(self):
        """Test case for reload_metadata

        
        """
        body = {
  "isolateId" : "isolateId"
}
        headers = { 
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer special-key',
        }
        response = self.client.open(
            '/api/analysis/reload_metadata',
            method='POST',
            headers=headers,
            data=json.dumps(body),
            content_type='application/json')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_search_analysis(self):
        """Test case for search_analysis

        
        """
        query = {
  "analysis_sorting" : {
    "column" : "column",
    "ascending" : true
  },
  "paging_token" : "paging_token",
  "expression" : {
    "left" : {
      "term_max" : "term_max",
      "field" : "field",
      "left" : "{}",
      "prefix" : "prefix",
      "term" : "term",
      "right" : "{}",
      "term_min" : "term_min"
    },
    "right" : {
      "term_max" : "term_max",
      "field" : "field",
      "left" : "{}",
      "prefix" : "prefix",
      "term" : "term",
      "right" : "{}",
      "term_min" : "term_min"
    }
  },
  "filters" : "{}",
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
