#!/usr/bin/env bash

# directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

${DIR}/configure.sh

docker-compose up --build
