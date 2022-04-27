import unittest
import pymongo
from bson.json_util import dumps

from aggregation import agg_pipeline


class AggregationPipelineTest(unittest.TestCase):
    """
    Test Fixture
    """

    def setUp(self) -> None:
        """
        Connections to Bifrost Test database and ensure primary connection

        Returns: None
        """
        self.client = pymongo.MongoClient("mongodb://bifrost_db:27017/bifrost_test")
        if not self.client.is_primary:
            self.client = self.client.primary

        self.db = self.client.get_database()

    def tearDown(self) -> None:
        """
        Ensures the connection is closed for good practice

        Returns: None
        """
        self.client.close()

    def testAggregationPipeline(self):
        """
        Tests aggregation pipeline does not result in error and the results

        Returns: None
        """
        samples = self.db["samples"]
        samples.aggregate(agg_pipeline())

        sap_analysis_results = self.db["sap_analysis_results"]

        results_content = sap_analysis_results.find()

        self.assertEqual(
            len(list(results_content)),
            16,
            "Expects sap_analysis_results to contain 16 documents",
        )


if __name__ == "__main__":
    unittest.main()
