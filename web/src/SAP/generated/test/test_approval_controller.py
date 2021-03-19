# coding: utf-8

import unittest

from flask import json
from six import BytesIO

from web.src.SAP.generated.models.approval import Approval  # noqa: E501
from web.src.SAP.generated.models.approval_request import ApprovalRequest  # noqa: E501
from .test import BaseTestCase


class TestApprovalController(BaseTestCase):
    """ApprovalController integration test stubs"""

    def test_cancel_approval(self):
        """Test case for cancel_approval

        
        """
        headers = { 
            'Authorization': 'Bearer special-key',
        }
        response = self.client.open(
            '/api/approvals/{approval_id}'.format(approval_id='approval_id_example'),
            method='DELETE',
            headers=headers)
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_create_approval(self):
        """Test case for create_approval

        
        """
        body = {}
        headers = { 
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer special-key',
        }
        response = self.client.open(
            '/api/approvals',
            method='POST',
            headers=headers,
            data=json.dumps(body),
            content_type='application/json')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_full_approval_matrix(self):
        """Test case for full_approval_matrix

        
        """
        headers = { 
            'Accept': 'application/json',
            'Authorization': 'Bearer special-key',
        }
        response = self.client.open(
            '/api/approvals/matrix',
            method='GET',
            headers=headers)
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_get_approvals(self):
        """Test case for get_approvals

        
        """
        headers = { 
            'Accept': 'application/json',
            'Authorization': 'Bearer special-key',
        }
        response = self.client.open(
            '/api/approvals',
            method='GET',
            headers=headers)
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))


if __name__ == '__main__':
    unittest.main()
