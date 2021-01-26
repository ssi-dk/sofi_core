#/usr/bin/env sh

set -e

# Ensure a test account is automatically registered when running locally
# Called via healthcheck in the dev docker-compose.yml

# Only runs once the container is reported as OK

# Inits a Registration Flow
actionUrl=$(\
  curl -s -X GET -H "Accept: application/json" \
    "http://127.0.0.1:4433/self-service/registration/api" \
    | jq -r '.methods.password.config.action'\
)

# Complete Registration Flow with password method
curl -s -X POST -H  "Accept: application/json" -H "Content-Type: application/json" \
    -d '{"traits.email": "test@fvst.dk", "password": "test", "traits.institution": "FVST"}' \
    "$actionUrl"
