from pathlib import Path
from urllib.parse import urljoin

import connexion
import openapi_spec_validator
from flask_cors import CORS
from jsonschema import RefResolver

from .generated import encoder

import sys
import inspect
import web.src.SAP.migrations as migrations
from web.src.SAP.common.database import MIGRATIONS_COL_NAME,DB_NAME, get_connection


## --- MIGRATIONS ---

conn = get_connection()
mydb = conn[DB_NAME]
migrations_coll = mydb[MIGRATIONS_COL_NAME]


# The migrations work by dynamically loading all the functions in the migrations.py file. Then it compares these function names to the ones in the migrations collection
#  in the database. All migration functions whoose names are not in the migrations collection are executed, and after they are executed they are added to the collection.
#  This way all migrations are executed exactly once on each database.

already_executed = list(map(lambda x: x["name"], migrations_coll.find()))

migration_funcs = [
    func for name, func in inspect.getmembers(migrations, inspect.isfunction)
    if func.__module__ == migrations.__name__  # only functions defined there
]

for func in migration_funcs:
    name = func.__name__ 

    if name in already_executed:
        print("Skipping migration:",name,file=sys.stderr)
    else:
        print("Executing migration:",name,file=sys.stderr)
        try:
            func()
        except Exception:
            print("Migration",name,"failed with error:",sys.exception(),"Stopping all migration until this is fixed!",file=sys.stderr)
            break
        migrations_coll.insert({"name": name})
        

## --- Running the app ---
SPECIFICATION_DIR = "/app/openapi_specs/SOFI/"

# connexion tries to validate the spec before it bothers to resolve any refs.
# openapi_spec_validator does not recognize relative $refs, and needs them realized AOT.
# With those two issues combined, there's no way our multiple file schema can validate.
# We validate our specification beforehand, so no need for connexion to check anyway.
# So let's just stop re-validating our spec incorrectly on every request, shall we?
def noop(anything):
    return True


openapi_spec_validator.validate_v3_spec = noop


def create_app():
    app = connexion.App(__name__, specification_dir=SPECIFICATION_DIR)
    app.app.json_encoder = encoder.JSONEncoder
    CORS(app.app)
    app.add_api("SOFI.yaml", arguments={"title": "SOFI"}, pythonic_params=True)

    ## Start the encrypted connection instance on app boot
    get_connection()

    return app.app
