# coding: utf-8

import unittest

from flask import json
from six import BytesIO

from .test import BaseTestCase


class TestUploadController(BaseTestCase):
    """UploadController integration test stubs"""

    @unittest.skip("multipart/form-data not supported by Connexion")
    def test_isolate_upload(self):
        """Test case for isolate_upload

        
        """
        headers = { 
            'Content-Type': 'multipart/form-data',
            'Authorization': 'Bearer special-key',
        }
        data = dict(metadata='metadata_example',
                    file=(BytesIO(b'some file data'), 'file.txt'))
        response = self.client.open(
            '/api/isolateupload',
            method='POST',
            headers=headers,
            data=data,
            content_type='multipart/form-data')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))


if __name__ == '__main__':
    unittest.main()
