import unittest
import pymongo

from aggregation import agg_pipeline


class MyTestCase(unittest.TestCase):
    def setUp(self) -> None:
        self.client = pymongo.MongoClient("mongodb://bifrost_db:27017/bifrost_test")
        if not self.client.is_primary:
            self.client = self.client.primary

        self.db = self.client.get_database()

    def tearDown(self) -> None:
        self.client.close()

    def test_something(self):
        samples = self.client["bifrost_test"]["samples"]
        samples.aggregate(agg_pipeline())


if __name__ == "__main__":
    unittest.main()
