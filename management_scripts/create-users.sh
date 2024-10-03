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
  #kubectl exec keycloak-0 -c keycloak -- /opt/bitnami/keycloak/bin/kcadm.sh set-password --realm $REALM --userid $USER_ID --new-password $password --no-config --user $KEYCLOAK_ADMIN --password $KEYCLOAK_ADMIN_PASS --server http://localhost:8080/auth  
  echo "Setting attributes"
  kubectl exec keycloak-0 -c keycloak -- /opt/bitnami/keycloak/bin/kcadm.sh update users/$USER_ID --realm $REALM -s "requiredActions=[\"UPDATE_PASSWORD\"]" -s "attributes.sofi-data-clearance=$clearance" -s "attributes.institution=$org" --no-config --user $KEYCLOAK_ADMIN --password $KEYCLOAK_ADMIN_PASS --server http://localhost:8080/auth
  kubectl exec keycloak-0 -c keycloak -- /opt/bitnami/keycloak/bin/kcadm.sh update users/$USER_ID/groups/$GROUP_ID --realm $REALM -s userId=$USER_ID -s groupId=$GROUP_ID -n --no-config --user $KEYCLOAK_ADMIN --password $KEYCLOAK_ADMIN_PASS --server http://localhost:8080/auth
  ## Send password reset email
  kubectl exec keycloak-0 -c keycloak -- /opt/bitnami/keycloak/bin/kcadm.sh update users/$USER_ID/reset-password-email --realm $REALM --no-config --user $KEYCLOAK_ADMIN --password $KEYCLOAK_ADMIN_PASS --server http://localhost:8080/auth
}



display_usage() { 
  echo "This script invites a user to SOFI by email." 
  echo -e "\nUsage: $0 <email-address> <organization> <data-clearance> <group> <firstname> <lastname>" 
  echo -e "\n\t<organization> can be one of:"
  echo -e "\t\tFVST"
  echo -e "\t\tSSI"
  echo -e "\n\t<data-clearance> can be one of:"
  echo -e "\t\town-institution"
  echo -e "\t\tcross-institution"
  echo -e "\n\t<group> can be one of:"
  echo -e "\t\tsofi.passive"
  echo -e "\t\tsofi.lab"
  echo -e "\t\tsofi.lab-ac"
  echo -e "\t\tsofi.microbiologists"
  echo -e "\t\tsofi.administrators"
  echo -e "\n"
} 

if [  $# -le 3 ] 
then 
  display_usage
  exit 1
fi 
 
# check if user has supplied -h or --help and display usage
if [[ $* == *--help* || $* == *-h* ]]
then 
  display_usage
  exit 0
fi 

createUser $1 $2 $3 $4 $5 $6



