#/usr/bin/env bash

set -Eeuo pipefail

# Test connectivity to TBR

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

source $SCRIPT_DIR/../.env

payload='[{"IsolateId": "2410W25984", "RowVer": 0}]'

output=$( curl -i --silent \
               --key ../$TBR_CLIENT_KEY \
               --cert ../$TBR_CLIENT_CERT \
               -H "Content-Type: application/json" \
               -X POST -d "$payload" \
               "$TBR_API_URL/api/Isolate/ChangedIsolates")

echo "$output"

if [[ $output == *'403 Forbidden'* ]]; then
    echo "TBR Connectivity: Failed"
    exit 1
else
    echo "TBR Connectivity: OK"
fi
