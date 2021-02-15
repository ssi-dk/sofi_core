# import .database
import pymongo
import json
from web.src.SAP.generated.models import UserDefinedView
from ...common.database import get_connection, DB_NAME, USERVIEWS_COL_NAME


def trim(item):
    item.pop("_id", None)
    item.pop("username", None)
    return item


def get_views(user: str):
    conn = get_connection()
    db = conn["sap_test"]
    views = db[USERVIEWS_COL_NAME]
    return list(map(trim, views.find({"username": user})))


def create_view(user: str, user_defined_view: UserDefinedView):
    conn = get_connection()
    db = conn["sap_test"]
    views = db[USERVIEWS_COL_NAME]
    record = {**user_defined_view.to_dict(), "username": user}
    return views.insert_one(record)


def remove_view(user: str, view_name: str):
    conn = get_connection()
    db = conn["sap_test"]
    views = db[USERVIEWS_COL_NAME]
    return views.delete_one({"username": user, "name": view_name})
