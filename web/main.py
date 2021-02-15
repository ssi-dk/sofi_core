"""Application entry point."""
from __future__ import absolute_import
import os
from flask_jwt_extended import JWTManager
from jwcrypto.jwk import JWK
import requests
import json
from web.src.SAP import create_app

app = create_app()

# Get JWK from identity provider
idp = os.environ["IDP"]
headers = {"Accept": "application/json"}

r = requests.get(idp + "/.well-known/jwks.json", params={}, headers=headers)

jsonkeys = r.json()
jsonkey = jsonkeys["keys"][0]
jwk_json = json.dumps(jsonkey)
jwk = JWK.from_json(jwk_json)

# Convert JWK to PEM so that JWTManager can consume it
pem = jwk.export_to_pem()

# Configure JWTManager
app.config["JWT_PUBLIC_KEY"] = pem
app.config["JWT_DECODE_AUDIENCE"] = os.environ["SOFI_CLIENT_ID"]
app.config["JWT_IDENTITY_CLAIM"] = "email"
app.config["JWT_ALGORITHM"] = jsonkey["alg"]
JWTManager(app)

if __name__ == "__main__":
    app.run(host="0.0.0.0")
