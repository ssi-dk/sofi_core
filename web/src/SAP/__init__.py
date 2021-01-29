import connexion
from .generated import encoder
from .src.repositories.database import get_connection



def create_app():
    app = connexion.App(__name__, specification_dir="../../../openapi_specs/SAP/")
    app.app.json_encoder = encoder.JSONEncoder
    app.add_api("SAP.yaml", arguments={"title": "SAP"}, pythonic_params=True)
    
    ## Start the encrypted connection instance on app boot
    get_connection()
    
    return app.app
