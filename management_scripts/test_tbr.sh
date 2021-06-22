#/usr/bin/env bash

set -Eeuo pipefail

# Test connectivity to TBR

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

source $SCRIPT_DIR/../.env

output=$( curl -i --silent \
               --key ../$TBR_CLIENT_KEY \
               --cert ../$TBR_CLIENT_CERT \
               "$TBR_API_URL/index.html" | grep 'HTTP/1.1')

echo "$output"

if [[ $output == *'403 Forbidden'* ]]; then
    echo "TBR Connectivity: Failed"
    exit 1
else
    echo "TBR Connectivity: OK"
fi
