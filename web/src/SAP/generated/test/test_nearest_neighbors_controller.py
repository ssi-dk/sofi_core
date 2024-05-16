# coding: utf-8

import unittest

from flask import json
from six import BytesIO

from web.src.SAP.generated.models.bio_api_job_response import BioApiJobResponse  # noqa: E501
from web.src.SAP.generated.models.nearest_neighbors_request import NearestNeighborsRequest  # noqa: E501
from .test import BaseTestCase


class TestNearestNeighborsController(BaseTestCase):
    """NearestNeighborsController integration test stubs"""

    def test_post(self):
        """Test case for post

        
        """
        body = {
  "unknownsAreDiffs" : true,
  "id" : "id",
  "cutoff" : 0
}
        headers = { 
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer special-key',
        }
        response = self.client.open(
            '/api/nearest_neighbors',
            method='POST',
            headers=headers,
            data=json.dumps(body),
            content_type='application/json')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))


if __name__ == '__main__':
    unittest.main()
