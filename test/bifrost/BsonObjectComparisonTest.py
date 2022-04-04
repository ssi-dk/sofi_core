import BsonObjectComparison

import unittest
import datetime
import bson


class BsonObjectComparisonTest(unittest.TestCase):
    def test_date(self):
        self.assertEqual(
            [],
            BsonObjectComparison.compare(
                {"date_sofi": datetime.datetime(2022, 2, 20, 7, 7, 40)},
                {"date_sofi": {"$date": "2022-02-20T07:07:40"}},
            ),
        )

        self.assertEqual(
            1,
            len(
                BsonObjectComparison.compare(
                    {"date_sofi": datetime.datetime(2022, 2, 20, 7, 7, 40)},
                    {"date_sofi": {"$date": "2022-02-20T07:08:40"}},
                )
            ),
        )

    def test_object_id(self):
        self.assertEqual(
            [],
            BsonObjectComparison.compare(
                {"_id": bson.ObjectId("6211e8bc207a1f796ec0b69d")},
                {"_id": {"$oid": "6211e8bc207a1f796ec0b69d"}},
            ),
        )

        self.assertEqual(
            1,
            len(
                BsonObjectComparison.compare(
                    {"_id": bson.ObjectId("6211e8bc207a1f796ec0b69d")},
                    {"_id": {"$oid": "6211e8bc207a1f796ec0a69d"}},
                )
            ),
        )


if __name__ == "__main__":
    unittest.main()
