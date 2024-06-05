#/usr/bin/env bash

set -Eeuo pipefail

# Test connectivity to LIMS

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

source $SCRIPT_DIR/../.env

JSON_STRING=$( jq -n \
                  --arg d "$LIMS_API_DATABASEID" \
                  --arg u "$LIMS_API_USERNAME" \
                  --arg p "$LIMS_API_PASSWORD" \
                  '{"databaseid": $d,"username": $u, "password": $p}' )

output=$( curl -i \
               -H "Content-Type: application/json" \
               -d "$JSON_STRING" \
               "$LIMS_API_URL/connections" )

echo "$output"

if [[ $output == *'status": "Created"'* ]]; then
    echo "LIMS Connectivity: OK"
else
    echo "LIMS Connectivity: Failed"
    exit 1
fi
