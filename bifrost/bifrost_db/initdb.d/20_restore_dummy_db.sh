#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

mongoimport --db bifrost_test --collection lims_metadata --file=${DIR}/lims.generated.jsonl
mongoimport --db bifrost_test --collection tbr_metadata --file=${DIR}/tbr.generated.jsonl
mongoimport --db bifrost_test --collection sap_analysis_results --file=${DIR}/analysis.generated.jsonl
# TODO: This should become a materialized view instead of a collection
mongoimport --db bifrost_test --collection sap_full_analysis --file=${DIR}/generated.jsonl
