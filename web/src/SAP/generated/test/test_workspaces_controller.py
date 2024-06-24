# coding: utf-8

import unittest

from flask import json
from six import BytesIO

from web.src.SAP.generated.models.build_workspace_tree_request_body import BuildWorkspaceTreeRequestBody  # noqa: E501
from web.src.SAP.generated.models.create_workspace import CreateWorkspace  # noqa: E501
from web.src.SAP.generated.models.update_workspace import UpdateWorkspace  # noqa: E501
from web.src.SAP.generated.models.workspace import Workspace  # noqa: E501
from web.src.SAP.generated.models.workspace_info import WorkspaceInfo  # noqa: E501
from .test import BaseTestCase


class TestWorkspacesController(BaseTestCase):
    """WorkspacesController integration test stubs"""

    def test_build_workspace_tree(self):
        """Test case for build_workspace_tree

        
        """
        build_workspace_tree_request_body = { }
        headers = { 
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer special-key',
        }
        response = self.client.open(
            '/api/workspace/{workspace_id}/tree'.format(workspace_id='workspace_id_example'),
            method='POST',
            headers=headers,
            data=json.dumps(build_workspace_tree_request_body),
            content_type='application/json')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_create_workspace(self):
        """Test case for create_workspace

        
        """
        create_workspace = {
  "name" : "name"
}
        headers = { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer special-key',
        }
        response = self.client.open(
            '/api/workspaces',
            method='POST',
            headers=headers,
            data=json.dumps(create_workspace),
            content_type='application/json')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

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

    def test_delete_workspace_sample(self):
        """Test case for delete_workspace_sample

        
        """
        headers = { 
            'Authorization': 'Bearer special-key',
        }
        response = self.client.open(
            '/api/workspace/{workspace_id}/{sample_id}'.format(workspace_id='workspace_id_example')sample_id='sample_id_example'),
            method='DELETE',
            headers=headers)
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_get_workspace(self):
        """Test case for get_workspace

        
        """
        headers = { 
            'Accept': 'application/json',
            'Authorization': 'Bearer special-key',
        }
        response = self.client.open(
            '/api/workspaces/{workspace_id}'.format(workspace_id='workspace_id_example'),
            method='GET',
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

    def test_post_workspace(self):
        """Test case for post_workspace

        
        """
        update_workspace = {
  "samples" : [ "samples", "samples" ]
}
        headers = { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer special-key',
        }
        response = self.client.open(
            '/api/workspaces/{workspace_id}'.format(workspace_id='workspace_id_example'),
            method='POST',
            headers=headers,
            data=json.dumps(update_workspace),
            content_type='application/json')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))


if __name__ == '__main__':
    unittest.main()
