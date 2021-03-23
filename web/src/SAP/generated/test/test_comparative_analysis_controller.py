# coding: utf-8

import unittest

from flask import json
from six import BytesIO

from web.src.SAP.generated.models.newick_tree_response import NewickTreeResponse  # noqa: E501
from .test import BaseTestCase


class TestComparativeAnalysisController(BaseTestCase):
    """ComparativeAnalysisController integration test stubs"""

    def test_get_comparative_newick_data(self):
        """Test case for get_comparative_newick_data

        
        """
        query_string = [('job_id', 'job_id_example')]
        headers = { 
            'Accept': 'application/json',
            'Authorization': 'Bearer special-key',
        }
        response = self.client.open(
            '/api/analysis/comparative/newick',
            method='GET',
            headers=headers,
            query_string=query_string)
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))


if __name__ == '__main__':
    unittest.main()
