#/usr/bin/env bash


set -euo pipefail

SOFI_HOSTNAME=dev.sofi-platform.dk
SOFI_PORT=8080

createUser(){
  # params
  email=$1
  org=$2
  clearance=$3
  group=$4

# TODO: access to this endpoint needs to be restricted so its only available from within the sofi local subnet

  actionUrl=$(\
    curl -k -s -X GET -H "Accept: application/json" \
      "https://${SOFI_HOSTNAME}:${SOFI_PORT}/.ory/kratos/public/self-service/registration/api" \
      | jq -r '.methods.password.config.action'\
  )

  echo $actionUrl

  $pw = `uuidgen -r`

  # Complete Registration Flow with password method
  curl -k -i -H "Accept: application/json" -H "Content-Type: application/json" \
       -d '{"traits.email": "'"${email}"'", "password": "'"${pw}"'", "traits.institution": "'"${org}"'", "traits.security-groups": "'"${group}"'", "traits.sofi-data-clearance": "'"${clearance}"'" }' \
       "$actionUrl"

  # TODO: automatically mark email address as verified and initiate a pw reset, instead of having to communicate the pw to the user
  echo -e "Credentials:"
  echo -e "\t${email}"
  echo -e "\t${pw}"
}

display_usage() { 
  echo "This script invites a user to SOFI by email." 
  echo -e "\nUsage: $0 <email-address> <organization> <data-clearance> <group>" 
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

if [  $# -le 4 ] 
then 
  display_usage
  exit 1
fi 
 
# check if user has supplied -h or --help and display usage
if [[ ( $# == "--help") ||  $# == "-h" ]] 
then 
  display_usage
  exit 0
fi 

# Super account with access to everything, for debugging purposes
createUser $1 $2 $3 $4
