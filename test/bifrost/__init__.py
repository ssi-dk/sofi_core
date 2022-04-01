import unittest

# from pymongo_inmemory import MongoClient


class MyTestCase(unittest.TestCase):
    client = None

    def setUpClass(self) -> None:
        # Do setup
        # self.client = MongoClient()
        # db = self.client['bifrost_test']
        # collection = db['samples']
        print("Hello test world")

    def tearDownClass(self) -> None:
        self.client.close()

    def test_something(self):
        self.assertEqual(True, True)  # add assertion here


if __name__ == "__main__":
    unittest.main()
