# coding: utf-8

import unittest

from flask import json
from six import BytesIO

from web.src.SAP.generated.models.user import User  # noqa: E501
from web.src.SAP.generated.models.user_defined_view import UserDefinedView  # noqa: E501
from .test import BaseTestCase


class TestUserController(BaseTestCase):
    """UserController integration test stubs"""

    @unittest.skip("*/* not supported by Connexion. Use application/json instead. See https://github.com/zalando/connexion/pull/760")
    def test_create_user(self):
        """Test case for create_user

        Create user
        """
        body = {}
        headers = { 
            'Content-Type': 'application/json',
        }
        response = self.client.open(
            '/api/user',
            method='POST',
            headers=headers,
            data=json.dumps(body),
            content_type='application/json')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_create_user_view(self):
        """Test case for create_user_view

        
        """
        user_defined_view = {
  "columns" : [ "columns", "columns" ],
  "name" : "name"
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

    def test_delete_user(self):
        """Test case for delete_user

        Delete user
        """
        headers = { 
        }
        response = self.client.open(
            '/api/user/{username}'.format(username='username_example'),
            method='DELETE',
            headers=headers)
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

    def test_get_user_by_name(self):
        """Test case for get_user_by_name

        Get user by user name
        """
        headers = { 
            'Accept': 'application/json',
        }
        response = self.client.open(
            '/api/user/{username}'.format(username='username_example'),
            method='GET',
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

    def test_login_user(self):
        """Test case for login_user

        Logs user into the system
        """
        query_string = [('username', 'username_example'),
                        ('password', 'password_example')]
        headers = { 
            'Accept': 'application/json',
        }
        response = self.client.open(
            '/api/user/login',
            method='GET',
            headers=headers,
            query_string=query_string)
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_logout_user(self):
        """Test case for logout_user

        Logs out current logged in user session
        """
        headers = { 
        }
        response = self.client.open(
            '/api/user/logout',
            method='GET',
            headers=headers)
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    @unittest.skip("*/* not supported by Connexion. Use application/json instead. See https://github.com/zalando/connexion/pull/760")
    def test_update_user(self):
        """Test case for update_user

        Updated user
        """
        body = {}
        headers = { 
            'Content-Type': 'application/json',
        }
        response = self.client.open(
            '/api/user/{username}'.format(username='username_example'),
            method='PUT',
            headers=headers,
            data=json.dumps(body),
            content_type='application/json')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))


if __name__ == '__main__':
    unittest.main()
