import os
from copy import deepcopy
import json
from jsonschema import RefResolver
import connexion
from connexion import spec
import openapi_spec_validator
from connexion.utils import deep_get
from connexion.json_schema import default_handlers as json_schema_handlers
from openapi_spec_validator import default_handlers as spec_validator_handlers
from .generated import encoder
from .common.database import get_connection

# jsonschema does not handle relative file paths:
#  https://github.com/zalando/connexion/issues/967

try:
    from collections.abc import Mapping
except ImportError:
    from collections import Mapping


SPECIFICATION_DIR = "/app/openapi_specs/SAP/"


def my_resolve_refs(spec, store=None, handlers=None):
    """
    Resolve JSON references like {"$ref": <some URI>} in a spec.
    Optionally takes a store, which is a mapping from reference URLs to a
    dereferenced objects. Prepopulating the store can avoid network calls.
    """
    from connexion.json_schema import default_handlers

    spec = deepcopy(spec)
    store = store or {}
    handlers = handlers or default_handlers
    resolver = RefResolver("", spec, store, handlers=handlers)

    def _do_resolve(node):
        if isinstance(node, Mapping) and "$ref" in node:
            path = node["$ref"][2:].split("/")
            try:
                # resolve known references
                node.update(deep_get(spec, path))
                del node["$ref"]
                return node
            except KeyError:
                # resolve external references
                with resolver.resolving(node["$ref"]) as resolved:
                    # if not fixed:
                    #     return resolved
                    # else:
                    return _do_resolve(resolved)
                    # endfix
        elif isinstance(node, Mapping):
            for k, v in node.items():
                node[k] = _do_resolve(v)
        elif isinstance(node, (list, tuple)):
            for i, _ in enumerate(node):
                node[i] = _do_resolve(node[i])
        return node

    res = _do_resolve(spec)
    return res


def my_local_file_handler(uri):
    """return the parsed result"""
    import yaml

    patchedUri = uri if not uri.startswith("./") else uri[2:]
    with open(os.path.join(SPECIFICATION_DIR, patchedUri), "r") as f:
        if patchedUri.endswith(".json"):
            return json.load(f)
        else:
            return yaml.load(f, Loader=yaml.SafeLoader)


json_schema_handlers[""] = my_local_file_handler
spec_validator_handlers[""] = my_local_file_handler

# patch refresolver-bug: (does not handle relative refs correct in path scopes)
from jsonschema.validators import RefResolver


def myresolve(self, ref):
    url = self._urljoin_cache(self.resolution_scope, ref)
    return ref, self._remote_cache(url)


RefResolver.resolve = myresolve

spec.resolve_refs = my_resolve_refs

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
    app.add_api("SAP.yaml", arguments={"title": "SOFI"}, pythonic_params=True)

    ## Start the encrypted connection instance on app boot
    get_connection()

    return app.app
