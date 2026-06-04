# coding: utf-8

import unittest

from flask import json
from six import BytesIO

from web.src.SAP.generated.models.project import Project  # noqa: E501
from .test import BaseTestCase


class TestProjectsController(BaseTestCase):
    """ProjectsController integration test stubs"""

    def test_get_projects(self):
        """Test case for get_projects

        
        """
        headers = { 
            'Accept': 'application/json',
            'Authorization': 'Bearer special-key',
        }
        response = self.client.open(
            '/api/projects',
            method='GET',
            headers=headers)
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_set_is_private(self):
        """Test case for set_is_private

        
        """
        headers = { 
            'Authorization': 'Bearer special-key',
        }
        response = self.client.open(
            '/api/projects/{project_key}/{is_private}'.format(project_key='project_key_example')is_private=True),
            method='POST',
            headers=headers)
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))


if __name__ == '__main__':
    unittest.main()
