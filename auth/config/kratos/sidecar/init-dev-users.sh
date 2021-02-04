#/usr/bin/env sh

set -euo pipefail

# Ensure a test account is automatically registered when running locally

# Inits a Registration Flow
sleep 5s

pw="delegate21"

createUser(){
  # params
  email=$1
  org=$2
  clearance=$3
  group=$4

  actionUrl=$(\
    curl -k -s -X GET -H "Accept: application/json" \
      "https://${SOFI_HOSTNAME}:${SOFI_PORT}/.ory/kratos/public/self-service/registration/api" \
      | jq -r '.methods.password.config.action'\
  )

  echo $actionUrl

  # Complete Registration Flow with password method
  curl -k -i -H "Accept: application/json" -H "Content-Type: application/json" \
       -d '{"traits.email": "'"${email}"'", "password": "'"${pw}"'", "traits.institution": "'"${org}"'", "traits.security-groups": "'"${group}"'", "traits.sofi-data-clearance": "'"${clearance}"'" }' \
       "$actionUrl"
}

echo "Creating test users for dev environment"

# FVST users
createUser "user@fvst.dk" "FVST" "own-institution" "sofi.passive"
createUser "superuser@fvst.dk" "FVST" "cross-institution" "sofi.passive"
createUser "lab@fvst.dk" "FVST" "own-institution" "sofi.lab"
createUser "superlab@fvst.dk" "FVST" "cross-institution" "sofi.lab"
createUser "labac@fvst.dk" "FVST" "own-institution" "sofi.lab-ac"
createUser "superlabac@fvst.dk" "FVST" "cross-institution" "sofi.lab-ac"
createUser "micro@fvst.dk" "FVST" "own-institution" "sofi.microbiologists"
createUser "supermicro@fvst.dk" "FVST" "cross-institution" "sofi.microbiologists"
createUser "admin@fvst.dk" "FVST" "own-institution" "sofi.administrators"
createUser "superadmin@fvst.dk" "FVST" "cross-institution" "sofi.administrators"

# SSI users
createUser "user@ssi.dk" "SSI" "own-institution" "sofi.passive"
createUser "superuser@ssi.dk" "SSI" "cross-institution" "sofi.passive"
createUser "lab@ssi.dk" "SSI" "own-institution" "sofi.lab"
createUser "superlab@ssi.dk" "SSI" "cross-institution" "sofi.lab"
createUser "labac@ssi.dk" "SSI" "own-institution" "sofi.lab-ac"
createUser "superlabac@ssi.dk" "SSI" "cross-institution" "sofi.lab-ac"
createUser "micro@ssi.dk" "SSI" "own-institution" "sofi.microbiologists"
createUser "supermicro@ssi.dk" "SSI" "cross-institution" "sofi.microbiologists"
createUser "admin@ssi.dk" "SSI" "own-institution" "sofi.administrators"
createUser "superadmin@ssi.dk" "SSI" "cross-institution" "sofi.administrators"

# Super account with access to everything, for debugging purposes
createUser "debug@sofi.dk" "FVST" "all" "sofi.administrators"

echo "Finished creating test users for dev environment"