#/usr/bin/env bash 
 
set -Eeuo pipefail 
 
# Get metadata for an isolate from LIMS 
 
isolateId=$1 
 
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )" 
 
source $SCRIPT_DIR/../.env 
 
JSON_STRING=$( jq -n \ 
                  --arg d "$LIMS_API_DATABASEID" \ 
                  --arg u "$LIMS_API_USERNAME" \ 
                  --arg p "$LIMS_API_PASSWORD" \ 
                  '{"databaseid": $d,"username": $u, "password": $p}' ) 
 
curl -i \ 
     -H "Content-Type: application/json" \ 
     --cookie lims_cookie.txt \ 
     --cookie-jar lims_cookie.txt \ 
     -d "$JSON_STRING" \ 
     "$LIMS_API_URL/connections" 
 
REQ_STRING=$( jq -n \ 
                 --arg i "$isolateId" \ 
                 '{"isolateId": $i}' ) 
 
 
output=$( curl -i -H "Content-Type: application/json" \ 
                   -d "$REQ_STRING" \ 
                   --cookie lims_cookie.txt \ 
                   --cookie-jar lims_cookie.txt \ 
                   "$LIMS_API_URL/actions/GetIsolate" ) 
 
echo $output 
 
rm lims_cookie.txt 
