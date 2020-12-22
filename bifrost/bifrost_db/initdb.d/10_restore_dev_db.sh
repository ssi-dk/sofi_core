#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

mongorestore --archive=${DIR}/bifrost_dev_nofiles.archive --batchSize=50
