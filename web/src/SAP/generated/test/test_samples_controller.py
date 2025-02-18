# coding: utf-8

import unittest

from flask import json
from six import BytesIO

from web.src.SAP.generated.models.add_to_cluster import AddToCluster  # noqa: E501
from web.src.SAP.generated.models.sample import Sample  # noqa: E501
from .test import BaseTestCase


class TestSamplesController(BaseTestCase):
    """SamplesController integration test stubs"""

    def test_add_to_cluster(self):
        """Test case for add_to_cluster

        
        """
        add_to_cluster = {
  "clusterid" : "clusterid",
  "samples" : [ "samples", "samples" ]
}
        headers = { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer special-key',
        }
        response = self.client.open(
            '/api/samples/add_to_cluster',
            method='POST',
            headers=headers,
            data=json.dumps(add_to_cluster),
            content_type='application/json')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_get_sample_by_id(self):
        """Test case for get_sample_by_id

        
        """
        headers = { 
            'Accept': 'application/json',
            'Authorization': 'Bearer special-key',
        }
        response = self.client.open(
            '/api/samples/{sample_id}'.format(sample_id='sample_id_example'),
            method='GET',
            headers=headers)
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))


if __name__ == '__main__':
    unittest.main()
