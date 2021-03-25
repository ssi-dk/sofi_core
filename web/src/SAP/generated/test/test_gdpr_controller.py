# coding: utf-8

import unittest

from flask import json
from six import BytesIO

from web.src.SAP.generated.models.personal_data import PersonalData  # noqa: E501
from web.src.SAP.generated.models.personal_identifier_type import PersonalIdentifierType  # noqa: E501
from .test import BaseTestCase


class TestGdprController(BaseTestCase):
    """GdprController integration test stubs"""

    def test_extract_data_from_pi(self):
        """Test case for extract_data_from_pi

        
        """
        query_string = [('identifier_type', {})
                        ('identifier', 'identifier_example')]
        headers = { 
            'Accept': 'application/json',
            'Authorization': 'Bearer special-key',
        }
        response = self.client.open(
            '/api/gdpr/extract',
            method='GET',
            headers=headers,
            query_string=query_string)
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_forget_pii(self):
        """Test case for forget_pii

        
        """
        query_string = [('identifier_type', {})
                        ('identifier', 'identifier_example')]
        headers = { 
            'Accept': 'application/json',
            'Authorization': 'Bearer special-key',
        }
        response = self.client.open(
            '/api/gdpr/forget',
            method='GET',
            headers=headers,
            query_string=query_string)
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))


if __name__ == '__main__':
    unittest.main()
