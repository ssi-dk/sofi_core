#/usr/bin/env bash

set -euo pipefail

# internal IP of the kratos admin API
ENDPOINT="http://0.0.0.0:4434"

deleteUser(){
  # params
  email=$1

  id=`docker exec sofi_kratos_1 kratos identities list --format json -e $ENDPOINT | \
      jq -r "map(select(.recovery_addresses[].value == \"$email\")) | .[].id"`
  echo "User '$email' located with id '$id'"
  docker exec sofi_kratos_1 kratos identities delete $id -e $ENDPOINT
  echo "User deleted."
}

display_usage() { 
  echo "This script deletes a SOFI user by email address." 
  echo "The user loses the ability to sign in, but their data within SOFI (approval history, custom views, etc) persists."
  echo -e "\nUsage: $0 <email-address>"
  echo -e "\n"
} 

if [  $# -lt 1 ] 
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

deleteUser $1
