#/usr/bin/env sh

set -euo pipefail

# Ensure a test account is automatically registered when running locally

# Inits a Registration Flow
sleep 5s
echo "Creating test user for dev environment"

actionUrl=$(\
  curl -s -X GET -H "Accept: application/json" \
    "${SOFI_SCHEME}://${SOFI_HOSTNAME}:${SOFI_PORT}/.ory/kratos/public/self-service/registration/api" \
    | jq -r '.methods.password.config.action'\
)

echo $actionUrl

# Complete Registration Flow with password method
curl -i -H "Accept: application/json" -H "Content-Type: application/json" \
     -d '{"traits.email": "user@fvst.dk", "password": "delegate21", "traits.institution": "FVST"}' \
     "$actionUrl"
