#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

echo ${DIR}

# The mongo ... line is very important! Without it the next mongoimport's will fail with an error messages that does
# not make sense. rs.status() is enough, but the .ok is to limit the noise in the logs.
echo "rs.status().ok (expects 1):"
mongosh bifrost_test --eval "rs.status().ok"

mongoimport --db bifrost_test --collection sofi_species_to_mlstschema_mapping --file=${DIR}/species_to_mlstschema_mapping.jsonl

mongoimport --db bifrost_test --collection samples --file=${DIR}/samples.jsonl

# mongoimport --db bifrost_test --collection sap_lims_metadata --file=${DIR}/lims.generated.jsonl
# mongoimport --db bifrost_test --collection sap_tbr_metadata --file=${DIR}/tbr.generated.jsonl
# mongoimport --db bifrost_test --collection sap_analysis_results --file=${DIR}/analysis.generated.jsonl

# sap_analysis_results mimicks the collection that's made from the view materialization
# We do not need the full analysis table anymore, as we join the metadata tables with the analysis result tables.
# mongoimport --db bifrost_test --collection sap_full_analysis --file=${DIR}/generated.jsonl
