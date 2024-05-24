# coding: utf-8

import unittest

from flask import json
from six import BytesIO

from web.src.SAP.generated.models.workspace import Workspace  # noqa: E501
from .test import BaseTestCase


class TestWorkspacesController(BaseTestCase):
    """WorkspacesController integration test stubs"""

    def test_delete_workspace(self):
        """Test case for delete_workspace

        
        """
        headers = { 
            'Authorization': 'Bearer special-key',
        }
        response = self.client.open(
            '/api/workspaces/{workspace_id}'.format(workspace_id='workspace_id_example'),
            method='DELETE',
            headers=headers)
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_get_workspaces(self):
        """Test case for get_workspaces

        
        """
        headers = { 
            'Accept': 'application/json',
            'Authorization': 'Bearer special-key',
        }
        response = self.client.open(
            '/api/workspaces',
            method='GET',
            headers=headers)
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))


if __name__ == '__main__':
    unittest.main()
