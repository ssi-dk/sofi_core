#!/usr/bin/env bash

# directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

# generate typescript client from api-spec
rm -rf "${DIR}/app/sap-client/src"
rm -rf "${DIR}/app/sap-client/dist"
docker run --rm -v "${DIR}:/mnt" \
                --user "$(id -u):$(id -g)" \
                "openapitools/openapi-generator:cli-v4.3.0" \
                generate \
                -i "/mnt/openapi_specs/SAP/SAP.yaml" \
                -g typescript-redux-query \
                -o /mnt/app/src/sap-client
mv "${DIR}/app/src/sap-client/src/"* "${DIR}/app/src/sap-client"
rm -rf "${DIR}/app/src/sap-client/src/"

# generate flask api from api-spec
docker run --rm -v "${DIR}:/mnt" \
                --user "$(id -u):$(id -g)" \
                "openapitools/openapi-generator:cli-v4.3.0" \
                generate \
                -i "/mnt/openapi_specs/SAP/SAP.yaml" \
                -g python-flask \
                -o "/mnt/web/src/SAP" \
                -t "/mnt/openapi_specs/SAP/templates" \
                -c "/mnt/openapi_specs/SAP/SAP-config.yaml"

rm -rf "${DIR}/web/src/SAP/generated"
mv "${DIR}/web/src/SAP/web/src/SAP/generated" "${DIR}/web/src/SAP/generated"
