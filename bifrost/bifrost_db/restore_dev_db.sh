#!/usr/bin/env bash
set -e

echo "rs.initiate({ _id: 'rs0', version: 1, members: [{ _id: 0, host : 'bifrost_db:27017' }]}).ok || rs.status().ok" | mongo --quiet
mongorestore --archive=/tmp/bifrost_dev_nofiles.archive --batchSize=50
