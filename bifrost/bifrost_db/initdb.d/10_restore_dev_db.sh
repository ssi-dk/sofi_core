#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

#gunzip -c ${DIR}/bifrost_test.archive.gz | mongorestore --archive

#mongo --eval 'use bifrost_test'

# Create Admin database
  # Create the user that will connect to it
  # Maybe auto by mongo - create admin
  # Check the 'old' version
# Create `bifrost_test` database