cp ../../bifrost/bifrost_listener/aggregation.py .
cp -r ../../bifrost/bifrost_db/initdb.d/ ./initdb.d

docker build . -t sofi_test:latest

rm aggregation.py
rm -rf ./initdb.d
