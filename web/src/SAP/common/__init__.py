import sys
import inspect
import web.src.SAP.common.migrations as migrations
from web.src.SAP.common.database import MIGRATIONS_COL_NAME,DB_NAME, get_connection

conn = get_connection()
mydb = conn[DB_NAME]
migrations_coll = mydb[MIGRATIONS_COL_NAME]

already_executed = list(map(lambda x: x["name"], migrations_coll.find()))


migration_funcs = [
    func for name, func in inspect.getmembers(migrations, inspect.isfunction)
    if func.__module__ == migrations.__name__  # only functions defined there
]

print(already_executed,file=sys.stderr)

# Example: conditionally execute
for func in migration_funcs:
    name = func.__name__ 

    if name in already_executed:
        print("Skipping migration:",name,file=sys.stderr)
    else:
        print("Executing:",name,file=sys.stderr)
        try:
            func()
        except Exception:
            print("Migration",name,"failed with error:",sys.exception(),"Stopping all migration until this is fixed!",file=sys.stderr)
            break
        migrations_coll.insert({"name": name})
        