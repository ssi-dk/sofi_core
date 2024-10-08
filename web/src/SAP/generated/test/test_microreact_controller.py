# coding: utf-8

import unittest

from flask import json
from six import BytesIO

from web.src.SAP.generated.models.microreact_url_response import MicroreactUrlResponse  # noqa: E501
from web.src.SAP.generated.models.new_microreact_project_request import NewMicroreactProjectRequest  # noqa: E501
from web.src.SAP.generated.models.new_microreact_project_response import NewMicroreactProjectResponse  # noqa: E501
from .test import BaseTestCase


class TestMicroreactController(BaseTestCase):
    """MicroreactController integration test stubs"""

    def test_get_microreact_url(self):
        """Test case for get_microreact_url

        
        """
        headers = { 
            'Accept': 'application/json',
            'Authorization': 'Bearer special-key',
        }
        response = self.client.open(
            '/api/microreact_integration/base_url',
            method='GET',
            headers=headers)
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_send_to_microreact(self):
        """Test case for send_to_microreact

        
        """
        body = {
  "workspace" : "workspace",
  "tree_methods" : [ null, null ],
  "mr_access_token" : "mr_access_token"
}
        headers = { 
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer special-key',
        }
        response = self.client.open(
            '/api/microreact_integration',
            method='POST',
            headers=headers,
            data=json.dumps(body),
            content_type='application/json')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))


if __name__ == '__main__':
    unittest.main()
