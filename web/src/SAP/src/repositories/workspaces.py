from ...common.database import get_connection, DB_NAME, WORKSPACES_COL_NAME

def trim(item):
    item["id"] = str(item["_id"])
    item.pop("_id", None)
    item.pop("username", None)
    return item

def get_workspaces(user: str):
    conn = get_connection()
    db = conn[DB_NAME]
    views = db[WORKSPACES_COL_NAME]
    return list(map(trim, views.find({"created_by": user})))


