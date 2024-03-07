# coding: utf-8

import unittest

from flask import json
from six import BytesIO

from web.src.SAP.generated.models.health_response import HealthResponse  # noqa: E501
from .test import BaseTestCase


class TestHealthController(BaseTestCase):
    """HealthController integration test stubs"""

    def test_health_ext_lims(self):
        """Test case for health_ext_lims

        
        """
        headers = { 
            'Accept': 'application/json',
            'Authorization': 'Bearer special-key',
        }
        response = self.client.open(
            '/api/health_ext_lims',
            method='GET',
            headers=headers)
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_health_ext_tbr(self):
        """Test case for health_ext_tbr

        
        """
        headers = { 
            'Accept': 'application/json',
            'Authorization': 'Bearer special-key',
        }
        response = self.client.open(
            '/api/health_ext_tbr',
            method='GET',
            headers=headers)
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))


if __name__ == '__main__':
    unittest.main()
