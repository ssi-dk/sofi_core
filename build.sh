#!/usr/bin/env bash

# directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

${DIR}/configure.sh
${DIR}/gen_openapi_clients.sh

CURRENT_UID=$(id -u):$(id -g) docker-compose up --build
