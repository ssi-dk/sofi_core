#/usr/bin/env sh

set -e

# Ensure the public client application is registered when running locally
echo "Generating client"
hydra clients create --endpoint 'http://127.0.0.1:4445' \
    --id ${SOFI_CLIENT_ID} \
    --token-endpoint-auth-method none \
    --scope openid,offline,offline_access,email,profile \
    --grant-types authorization_code,refresh_token \
    --callbacks "https://${SOFI_HOSTNAME}:${SOFI_PORT}/callback" \
    --fake-tls-termination