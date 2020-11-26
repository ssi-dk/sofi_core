#!/usr/bin/env bash

mongo --eval "printjson(rs.initiate());"
mongorestore --archive=/tmp/bifrost_dev_nofiles.archive --batchSize=50
