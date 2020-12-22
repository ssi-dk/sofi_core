#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

#echo "rs.initiate({ _id: 'rs0', version: 1, members: [{ _id: 0, host : '127.0.0.1:27017' }]}).ok || rs.status().ok" | mongo --quiet
#echo "rs.slaveOk()"
#echo "db.getMongo().setReadPref('nearest')"
#echo "db.getMongo().setSlaveOk()"
mongorestore --archive=${DIR}/bifrost_dev_nofiles.archive --batchSize=50
