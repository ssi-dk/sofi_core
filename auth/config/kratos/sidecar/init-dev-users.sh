#/usr/bin/env sh

set -euo pipefail

# Ensure a test account is automatically registered when running locally

# Inits a Registration Flow
sleep 15s
echo "Creating test user for dev environment"

actionUrl=$(\
  curl -s -X GET -H "Accept: application/json" \
    "http://kratos:4433/self-service/registration/api" \
    | jq -r '.methods.password.config.action'\
)

# Complete Registration Flow with password method
curl -i -X POST -H "Accept: application/json" -H "Content-Type: application/json" \
    -d '{"traits.email": "user@fvst.dk", "password": "delegate21", "traits.institution": "FVST"}' \
    "$actionUrl"
