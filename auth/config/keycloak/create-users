#!/bin/bash

REALM="sofi"
password="Delegate21!"

createUser(){
  # params
  email=$1
  username=$1
  org=$2
  clearance=$3
  group=$4


  docker exec keycloak /opt/keycloak/bin/kcadm.sh config credentials --server http://keycloak:8080/auth --realm master --user admin --password admin
  echo "Get groups" 
  GROUP_ID=$((docker exec keycloak /opt/keycloak/bin/kcadm.sh get groups -r $REALM --fields id,name) | jq -r '.[] | select(.name=="'$group'") | .id')
  
  echo "Creating user $username"
  #IFS=':' read -r username email password <<<"$user"
  docker exec keycloak /opt/keycloak/bin/kcadm.sh create users -r $REALM -s username=$username -s enabled=true -s email=$email  
  echo "Setting password"
  USER_ID=$(docker exec keycloak /opt/keycloak/bin/kcadm.sh get users -r $REALM -q username=$username --fields id --format csv --noquotes | tail -n 1)
  docker exec keycloak /opt/keycloak/bin/kcadm.sh set-password -r $REALM --userid $USER_ID --new-password $password
  docker exec keycloak /opt/keycloak/bin/kcadm.sh update users/$USER_ID -r $REALM -s "attributes.institution=$org"
  docker exec keycloak /opt/keycloak/bin/kcadm.sh update users/$USER_ID -r $REALM -s "attributes.sofi-data-clearance=$clearance"
  docker exec keycloak /opt/keycloak/bin/kcadm.sh update users/$USER_ID/groups/$GROUP_ID -r $REALM -s userId=$USER_ID -s groupId=$GROUP_ID -n
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
