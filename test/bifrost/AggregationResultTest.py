import json
import unittest
import pymongo

from bson.objectid import ObjectId

from aggregation import agg_pipeline

from BsonObjectComparison import compare


class AggregationResultTest(unittest.TestCase):
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

        samples = self.db["samples"]
        samples.aggregate(agg_pipeline())

        self.sap_analysis_results = self.db["sap_analysis_results"]

        with (open("data/sap_analysis_results.json")) as results:
            self.expected_results = json.load(results)

    def tearDown(self) -> None:
        """
        Ensures the connection is closed for good practice

        Returns: None
        """
        self.client.close()

    def testResultSize(self):
        """

        Returns: None
        """
        results_content = self.sap_analysis_results.find()

        self.assertEqual(
            len(list(results_content)),
            15,
            "Expects sap_analysis_results to contain 15 documents",
        )

    def testResultContent(self):
        """

        Returns:
        """
        for expected in self.expected_results:
            actual = self.sap_analysis_results.find_one(
                {"_id": ObjectId(expected["_id"]["$oid"])}
            )

            self.assertIsNotNone(actual)
            self.maxDiff = None

            compare_result = compare(expected, actual)

            if len(compare_result) > 0:
                self.fail(compare_result)


if __name__ == "__main__":
    unittest.main()
