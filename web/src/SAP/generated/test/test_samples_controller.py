# coding: utf-8

import unittest

from flask import json
from six import BytesIO

from web.src.SAP.generated.models.sample import Sample  # noqa: E501
from .test import BaseTestCase


class TestSamplesController(BaseTestCase):
    """SamplesController integration test stubs"""

    def test_get_sample_by_id(self):
        """Test case for get_sample_by_id

        
        """
        headers = { 
            'Accept': 'application/json',
            'Authorization': 'Bearer special-key',
        }
        response = self.client.open(
            '/api/samples/{sequence_id}'.format(sequence_id='sequence_id_example'),
            method='GET',
            headers=headers)
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))


if __name__ == '__main__':
    unittest.main()
