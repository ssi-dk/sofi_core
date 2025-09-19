#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
source $SCRIPT_DIR/../.env



createUser(){
  # params
  email=$1
  username=$1
  org=$2
  clearance=$3
  group=$4
  firstname=$5
  lastname=$6

#  kubectl exec -it keycloak-0 -c keycloak -- "/opt/bitnami/keycloak/bin/kcadm.sh config credentials --server http://keycloak:8080/auth --realm master --user admin --password admin"
  echo "Get groups"
  GROUP_ID=$((kubectl exec keycloak-0 -c keycloak -- /opt/bitnami/keycloak/bin/kcadm.sh get groups --realm $REALM --fields id,name --no-config --user $KEYCLOAK_ADMIN --password $KEYCLOAK_ADMIN_PASS --server http://localhost:8080/auth) | jq -r '.[] | select(.name=="'$group'") | .id')

  echo "Creating user $username"
  #IFS=':' read -r username email password <<<"$user"
  kubectl exec keycloak-0 -c keycloak -- /opt/bitnami/keycloak/bin/kcadm.sh create users --realm $REALM -s username=$username -s "firstName=$firstname" -s "lastName=$lastname" -s enabled=true -s emailVerified=true -s email=$email --no-config --user $KEYCLOAK_ADMIN --password $KEYCLOAK_ADMIN_PASS --server http://localhost:8080/auth
  #Getting user id
  USER_ID=$(kubectl exec keycloak-0 -c keycloak -- /opt/bitnami/keycloak/bin/kcadm.sh get users --realm $REALM -q username=$username --fields id --format csv --noquotes --no-config --user $KEYCLOAK_ADMIN --password $KEYCLOAK_ADMIN_PASS --server http://localhost:8080/auth | tail -n 1)
  kubectl exec keycloak-0 -c keycloak -- /opt/bitnami/keycloak/bin/kcadm.sh set-password --realm $REALM --userid $USER_ID --new-password $SOFI_TESTUSER_PASS --no-config --user $KEYCLOAK_ADMIN --password $KEYCLOAK_ADMIN_PASS --server http://localhost:8080/auth  
  echo "Setting attributes"
  kubectl exec keycloak-0 -c keycloak -- /opt/bitnami/keycloak/bin/kcadm.sh update users/$USER_ID --realm $REALM -s "attributes.sofi-data-clearance=$clearance" -s "attributes.institution=$org" --no-config --user $KEYCLOAK_ADMIN --password $KEYCLOAK_ADMIN_PASS --server http://localhost:8080/auth
  kubectl exec keycloak-0 -c keycloak -- /opt/bitnami/keycloak/bin/kcadm.sh update users/$USER_ID/groups/$GROUP_ID --realm $REALM -s userId=$USER_ID -s groupId=$GROUP_ID -n --no-config --user $KEYCLOAK_ADMIN --password $KEYCLOAK_ADMIN_PASS --server http://localhost:8080/auth
  ## Send password reset email
  #kubectl exec keycloak-0 -c keycloak -- /opt/bitnami/keycloak/bin/kcadm.sh update users/$USER_ID/reset-password-email --realm $REALM --no-config --user $KEYCLOAK_ADMIN --password $KEYCLOAK_ADMIN_PASS --server http://localhost:8080/auth
}


# FVST users
#createUser "micro@fvst.dk" "FVST" "own-institution" "sofi.microbiologists"
#createUser "supermicro@fvst.dk" "FVST" "cross-institution" "sofi.microbiologists"
#createUser "admin@fvst.dk" "FVST" "own-institution" "sofi.administrators"
#createUser "superadmin@fvst.dk" "FVST" "cross-institution" "sofi.administrators"

# SSI users
#createUser "user@ssi.dk" "SSI" "own-institution" "sofi.passive"
#createUser "superuser@ssi.dk" "SSI" "cross-institution" "sofi.passive"
#createUser "lab@ssi.dk" "SSI" "own-institution" "sofi.lab"
#createUser "superlab@ssi.dk" "SSI" "cross-institution" "sofi.lab"
#createUser "labac@ssi.dk" "SSI" "own-institution" "sofi.lab-ac"
#createUser "superlabac@ssi.dk" "SSI" "cross-institution" "sofi.lab-ac"
#createUser "micro@ssi.dk" "SSI" "own-institution" "sofi.microbiologists"
#createUser "supermicro@ssi.dk" "SSI" "cross-institution" "sofi.microbiologists"
#createUser "admin@ssi.dk" "SSI" "own-institution" "s

# Super account with access to everything, for debugging purposes
createUser "debug@sofi.dk" "FVST" "all" "sofi.administrators"

echo "Finished creating test users for dev environment"