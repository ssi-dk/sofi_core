import connexion
from .generated import encoder


def create_app():
    app = connexion.App(__name__, specification_dir="../../../openapi-specs/SAP/")
    app.app.json_encoder = encoder.JSONEncoder
    app.add_api("SAP.yaml", arguments={"title": "SAP"}, pythonic_params=True)
    return app.app
