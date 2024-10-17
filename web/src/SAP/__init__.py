from pathlib import Path
from urllib.parse import urljoin

import connexion
import openapi_spec_validator
from flask_cors import CORS
from jsonschema import RefResolver

from .common.database import get_connection
from .generated import encoder

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
