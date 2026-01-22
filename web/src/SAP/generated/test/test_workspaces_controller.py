# coding: utf-8

import unittest

from flask import json
from six import BytesIO

from web.src.SAP.generated.models.any_type import AnyType  # noqa: E501
from web.src.SAP.generated.models.clone_workspace import CloneWorkspace  # noqa: E501
from web.src.SAP.generated.models.create_workspace import CreateWorkspace  # noqa: E501
from web.src.SAP.generated.models.set_favorite import SetFavorite  # noqa: E501
from web.src.SAP.generated.models.update_workspace import UpdateWorkspace  # noqa: E501
from web.src.SAP.generated.models.workspace import Workspace  # noqa: E501
from web.src.SAP.generated.models.workspace_info import WorkspaceInfo  # noqa: E501
from .test import BaseTestCase


class TestWorkspacesController(BaseTestCase):
    """WorkspacesController integration test stubs"""

    def test_clone_workspace(self):
        """Test case for clone_workspace

        
        """
        clone_workspace = {
  "name" : "name",
  "id" : "id"
}
        headers = { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer special-key',
        }
        response = self.client.open(
            '/api/workspace/clone',
            method='POST',
            headers=headers,
            data=json.dumps(clone_workspace),
            content_type='application/json')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_create_workspace(self):
        """Test case for create_workspace

        
        """
        create_workspace = {
  "name" : "name",
  "samples" : [ "samples", "samples" ]
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

    def test_create_workspace_from_sequence_ids(self):
        """Test case for create_workspace_from_sequence_ids

        
        """
        create_workspace = {
  "name" : "name",
  "samples" : [ "samples", "samples" ]
}
        headers = { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer special-key',
        }
        response = self.client.open(
            '/api/workspaces/create_from_sequence_ids',
            method='POST',
            headers=headers,
            data=json.dumps(create_workspace),
            content_type='application/json')
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

    def test_get_workspace_data(self):
        """Test case for get_workspace_data

        
        """
        headers = { 
            'Accept': 'application/json',
            'Authorization': 'Bearer special-key',
        }
        response = self.client.open(
            '/api/workspaces/{workspace_id}/data'.format(workspace_id='workspace_id_example'),
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

    def test_leave_workspace(self):
        """Test case for leave_workspace

        
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

    def test_remove_workspace_samples(self):
        """Test case for remove_workspace_samples

        
        """
        update_workspace = {
  "samples" : [ "samples", "samples" ]
}
        headers = { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer special-key',
        }
        response = self.client.open(
            '/api/workspace/{workspace_id}/remove'.format(workspace_id='workspace_id_example'),
            method='POST',
            headers=headers,
            data=json.dumps(update_workspace),
            content_type='application/json')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_set_ws_favorite(self):
        """Test case for set_ws_favorite

        
        """
        set_favorite = {
  "workspaceId" : "workspaceId",
  "isFavorite" : true
}
        headers = { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer special-key',
        }
        response = self.client.open(
            '/api/workspace/setFavorite',
            method='POST',
            headers=headers,
            data=json.dumps(set_favorite),
            content_type='application/json')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))


if __name__ == '__main__':
    unittest.main()
