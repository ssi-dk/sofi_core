# coding: utf-8

import unittest

from flask import json
from six import BytesIO

from web.src.SAP.generated.models.new_microreact_project_request import NewMicroreactProjectRequest  # noqa: E501
from web.src.SAP.generated.models.new_microreact_project_response import NewMicroreactProjectResponse  # noqa: E501
from .test import BaseTestCase


class TestMicroreactController(BaseTestCase):
    """MicroreactController integration test stubs"""

    def test_send_to_microreact(self):
        """Test case for send_to_microreact

        
        """
        new_microreact_project_request = {
  "tree_calcs" : [ {
    "result" : "result",
    "method" : "method"
  }, {
    "result" : "result",
    "method" : "method"
  } ],
  "public" : false,
  "mr_access_token" : "mr_access_token",
  "mr_base_url" : "mr_base_url",
  "verify" : true,
  "project_name" : "project_name",
  "metadata_keys" : [ "metadata_keys", "metadata_keys" ],
  "metadata_values" : [ "metadata_values", "metadata_values" ]
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
            data=json.dumps(new_microreact_project_request),
            content_type='application/json')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))


if __name__ == '__main__':
    unittest.main()
