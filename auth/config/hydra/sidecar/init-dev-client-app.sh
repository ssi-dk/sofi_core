#/usr/bin/env sh

set -euo pipefail

# Ensure the public client application is registered when running locally

echo "Ensuring client application registered ..."

hydra clients create --endpoint 'hydra:4445' \
    --id ${SOFI_CLIENT_ID} \
    --token-endpoint-auth-method none \
    --scope openid,offline,offline_access,email,profile \
    --grant-types authorization_code,refresh_token \
    --callbacks "https://${SOFI_HOSTNAME}:${SOFI_PORT}/callback"