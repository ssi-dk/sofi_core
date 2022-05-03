#/usr/bin/env bash


set -euo pipefail

SRCDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
# sourced .env to get hostname and port
source "$SRCDIR/../.env"

updateUser(){
  # params
  email=$1
  org=$2
  clearance=$3
  group=$4

  # internal IP of the kratos admin API
  ENDPOINT="http://0.0.0.0:4434"

  userId=$(docker exec sofi_kratos_1 kratos identities list -e $ENDPOINT -f json | \
    jq -cr "[ .[] | select(.traits.email==\"$email\")][0].id")
  
  [ "$userId" = "null" ] && { echo "User with email '$email' could not be found." ; exit 1; }

  traits=$(jq -n --arg email "$email" --arg org "$org" --arg clearance "$clearance" --arg group "$group" '{
    "email": $email,
    "institution": $org,
    "security-groups": [$group],
    "sofi-data-clearance": $clearance
  }')

  PGPASSWORD=$PG_SECRET
  query="UPDATE \"public\".\"identities\" SET traits = '$traits' WHERE id = '$userId'"

  docker exec -it -u root sofi_postgresd_1 psql -U pguser -w -d "kratos" \
  -c "$query"
}

display_usage() { 
  echo "This script modifies a user's permissions to SOFI." 
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

updateUser $1 $2 $3 $4
