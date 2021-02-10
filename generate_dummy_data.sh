#!/bin/bash

# Use a prism mock to generate a JSON file you can import into MongoDB

set -Eeuo pipefail

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

outfile="${DIR}/bifrost/bifrost_db/initdb.d/generated.jsonl"
limsfile="${DIR}/bifrost/bifrost_db/initdb.d/lims.generated.jsonl"
tbrfile="${DIR}/bifrost/bifrost_db/initdb.d/tbr.generated.jsonl"
analysisfile="${DIR}/bifrost/bifrost_db/initdb.d/analysis.generated.jsonl"

if [ ! -f "$outfile" ]; then
    docker run -v "${PWD}:/local" -p 4011:4011 stoplight/prism:latest mock /local/openapi_specs/SAP/SAP.yaml -h 0.0.0.0 -p 4011 -d &
    dockerpid=$!

    sleep 5
    for i in {1..1000}; do
        curl -X GET "http://localhost:4011/analysis?paging_token=whatever&page_size=100" -H "accept: application/json" | jq -c .items[] >> $outfile ;
    done

    kill $dockerpid
fi

limsFields=(
    "isolate_id"
    "sequence_id"
    "sequence_filename"
    "institution"
    "project_number"
    "project_title"
    "sampling_date"
    "received_date"
    "run_id"
    "public"
    "provided_species"
    "primary_isolate"

    "chr_number"
    "aut_number"
    "product_type"
    "product"
    "origin_country"
    "animal_species"
    "sample_info"
    )

tbrFields=(
    "isolate_id"
    "sequence_id"
    "sequence_filename"
    "institution"
    "project_number"
    "project_title"
    "sampling_date"
    "received_date"
    "run_id"
    "public"
    "provided_species"
    "primary_isolate"

    "cpr"
    "gender"
    "name"
    "age"
    "travel"
    "travel_country"
    "run_date"
    "kma_received_date"
    "kma"
    "region"
    "fud_number"
    "cluster_id"
    "epi_export"
    )

analysisFields=(
    "_id"
    "isolate_id"
    "sequence_id"
    "institution"
    "resfinder_version"
    "QC_provided_species"
    "QC_genome1x"
    "QC_genome10x"
    "QC_Gsize_diff1x10"
    "QC_Avg_coverage"
    "QC_final"
    "subspecies"
    "species_final"
    "st"
    "pathotype"
    "pathotype_final"
    "serotype"
    "serotype_final"
    "adhesion"
    "toxins"
    "resistance_genes"
    "amr_profile"
    "amr_ami"
    "amr_amp"
    "amr_azi"
    "amr_fep"
    "amr_fot"
    "amr_f_c"
    "amr_fox"
    "amr_taz"
    "amr_t_c"
    "amr_chl"
    "amr_cip"
    "amr_cli"
    "amr_col"
    "amr_dap"
    "amr_etp"
    "amr_ery"
    "amr_fus"
    "amr_gen"
    "amr_imi"
    "amr_kan"
    "amr_lzd"
    "amr_mero"
    "amr_mup"
    "amr_nal"
    "amr_pen"
    "amr_syn"
    "amr_rif"
    "amr_str"
    "amr_sul"
    "amr_tei"
    "amr_trm"
    "amr_tet"
    "amr_tia"
    "amr_tgc"
    "amr_tmp"
    "amr_van"
)

limsFieldsJson=`printf '%s\n' "${limsFields[@]}" | jq -R . | jq -s .`
tbrFieldsJson=`printf '%s\n' "${tbrFields[@]}" | jq -R . | jq -s .`
analysisFieldsJson=`printf '%s\n' "${analysisFields[@]}" | jq -R . | jq -s .`

jq -c 'with_entries( select ( .key as $k | $keys | index($k) ) )' --argjson keys "$limsFieldsJson" $outfile > $limsfile
jq -c 'with_entries( select ( .key as $k | $keys | index($k) ) )' --argjson keys "$tbrFieldsJson" $outfile > $tbrfile
jq -c 'with_entries( select ( .key as $k | $keys | index($k) ) )' --argjson keys "$analysisFieldsJson" $outfile > $analysisfile
