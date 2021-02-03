#!/bin/sh 

set -e

FIRST_READY_STATUS_FLAG='/tmp/.FIRST_READY_STATUS_FLAG'

if [ ! -f "${FIRST_READY_STATUS_FLAG}" ]; then
    hydra clients list --endpoint 'http://127.0.0.1:4445' --fake-tls-termination
fi
