# coding: utf-8

import unittest

from flask import json
from six import BytesIO

from web.src.SAP.generated.models.user_defined_view import UserDefinedView  # noqa: E501
from web.src.SAP.generated.models.user_info import UserInfo  # noqa: E501
from .test import BaseTestCase


class TestUserController(BaseTestCase):
    """UserController integration test stubs"""

    def test_create_user_view(self):
        """Test case for create_user_view

        
        """
        user_defined_view = {
  "column_resizing" : {
    "column_width" : 6,
    "column_widths" : [ {
      "width" : 0,
      "columnName" : "columnName"
    }, {
      "width" : 0,
      "columnName" : "columnName"
    } ]
  },
  "hidden_columns" : [ "hidden_columns", "hidden_columns" ],
  "name" : "name",
  "sort_by" : [ {
    "id" : "id",
    "desc" : true
  }, {
    "id" : "id",
    "desc" : true
  } ],
  "column_order" : [ "column_order", "column_order" ]
}
        headers = { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer special-key',
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
            'Authorization': 'Bearer special-key',
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
            'Authorization': 'Bearer special-key',
        }
        response = self.client.open(
            '/api/user/views',
            method='GET',
            headers=headers)
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_who_am_i(self):
        """Test case for who_am_i

        
        """
        headers = { 
            'Accept': 'application/json',
            'Authorization': 'Bearer special-key',
        }
        response = self.client.open(
            '/api/me',
            method='GET',
            headers=headers)
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))


if __name__ == '__main__':
    unittest.main()
