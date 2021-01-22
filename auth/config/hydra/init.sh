#/usr/bin/env sh

set -e

# Ensure the public client application is registered when running locally
# Called via healthcheck in the dev docker-compose.yml

# Only runs once the container is reported as OK

hydra clients create --endpoint 'http://127.0.0.1:4445' \
    --id ${SOFI_CLIENT_ID} \
    --token-endpoint-auth-method none \
    --scope openid,offline,offline_access,email,profile \
    --callbacks "${SOFI_SCHEME}://${SOFI_HOSTNAME}:${SOFI_PORT}/callback"