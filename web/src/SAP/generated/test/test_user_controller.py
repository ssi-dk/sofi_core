# coding: utf-8

import unittest

from flask import json
from six import BytesIO

from web.src.SAP.generated.models.user_defined_view import UserDefinedView  # noqa: E501
from .test import BaseTestCase


class TestUserController(BaseTestCase):
    """UserController integration test stubs"""

    def test_create_user_view(self):
        """Test case for create_user_view

        
        """
        user_defined_view = {
  "hiddenColumns" : [ "hiddenColumns", "hiddenColumns" ],
  "columnOrder" : [ "columnOrder", "columnOrder" ],
  "name" : "name",
  "sortBy" : [ {
    "id" : "id",
    "desc" : true
  }, {
    "id" : "id",
    "desc" : true
  } ],
  "columnResizing" : {
    "columnWidth" : 6,
    "columnWidths" : [ {
      "width" : 0,
      "columnName" : "columnName"
    }, {
      "width" : 0,
      "columnName" : "columnName"
    } ]
  }
}
        headers = { 
            'Content-Type': 'application/json',
        }
        response = self.client.open(
            '/api/user/views',
            method='POST',
            headers=headers,
            data=json.dumps(user_defined_view),
            content_type='application/json')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_delete_view(self):
        """Test case for delete_view

        
        """
        headers = { 
        }
        response = self.client.open(
            '/api/user/views/{name}'.format(name='name_example'),
            method='DELETE',
            headers=headers)
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_get_user_views(self):
        """Test case for get_user_views

        
        """
        headers = { 
            'Accept': 'application/json',
        }
        response = self.client.open(
            '/api/user/views',
            method='GET',
            headers=headers)
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))


if __name__ == '__main__':
    unittest.main()
