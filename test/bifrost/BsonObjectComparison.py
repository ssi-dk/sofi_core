import datetime

import bson


def compare(obj1: {}, obj2: {}, errors=[]):
    """

    Args:
        obj1:
        obj2:
        errors:

    Returns:

    """
    if len(obj1) != len(obj2):
        errors.append(f"obj1 and obj2 is of different size. {len(obj1)} != {len(obj2)}")

    keys1, keys2 = obj1.keys(), obj2.keys()

    if not keys1 == keys2:
        errors.append(f"Set of keys are not equal. {keys1} != {keys2}")

    for (key1, value1) in obj1.items():
        if not value1 == obj2[key1]:

            if "bson" in str(type(value1)) or "datetime" in str(type(value1)):
                if not __compare_with_bson(value1, obj2[key1]):
                    errors.append(f"{key1}({value1}) != {key1}({obj2[key1]})")

            elif "bson" in str(type(obj2[key1])) or "datetime" in str(type(obj2[key1])):
                if not __compare_with_bson(obj2[key1], value1):
                    errors.append(f"{key1}({obj2[key1]}) != {key1}({value1})")

            else:
                errors.append(f"{key1}({value1}) != {key1}({obj2[key1]})")

    return errors


def __compare_with_bson(v1, v2):
    if isinstance(v1, bson.ObjectId):
        return {"$oid": str(v1)} == v2

    if isinstance(v1, datetime.datetime):
        return "$date" in v2 and v1.strftime("%Y-%m-%dT%H:%M:%S") in v2["$date"]
