# Bifrost

Use [Taskfile](https://taskfile.dev) to run the tests


## Test data

The local development database is initialized with a healthy/good `samples` collection created and verified by SSI/FVST, the database is initialized using this data and the aggreation result, `sap_analysis_results` is also exported/created used to test the aggregation pipeline. The two must be coherent.

Make sure 
* that the `samples.jsonl` is up-to-date and that the database `samples` collection consists of healthy/good data.
* that the `sap_analysis_results.jsonl` is generated from the `samples.jsonl` and that it is verified.

`mongoexport --jsonArray --db=bifrost_test --out=sap_analysis_results.json --collection=sap_analysis_results --forceTableScan`