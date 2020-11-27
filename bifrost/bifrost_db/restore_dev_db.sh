#!/usr/bin/env bash

echo "127.0.0.1  bifrost_db" >> /etc/hosts
mongo --eval "printjson(rs.initiate({ _id: 'rs0', version: 1, members: [{ _id: 0, host : 'bifrost_db:27017' }]}));"
mongorestore --archive=/tmp/bifrost_dev_nofiles.archive --batchSize=50
