from dataclasses import dataclass
import os
import time
from typing import List, Union
from flask import abort
from flask.json import jsonify
from pydantic import StrictStr
from os import environ

from .....microreact_integration.functions import (
    new_project_2 as new_microreact_project,
)
from ..security.permission_check import authorized_columns
from ..repositories.workspaces import get_workspace as get_workspace_db
from ..repositories.workspaces import get_workspace_data as get_workspace_data_db
from ..repositories.workspaces import update_microreact as update_microreact_db
from ....services.bio_api.openapi.api.distances_api import DistancesApi
from ....services.bio_api.openapi.api.trees_api import TreesApi
from ....services.bio_api.openapi.api_client import ApiClient
from ....services.bio_api.openapi.configuration import Configuration
from ....services.bio_api.openapi.models.distance_matrix_request import (
    DistanceMatrixRequest,
)
from ....services.bio_api.openapi.models.hc_tree_calc_request import HCTreeCalcRequest


@dataclass
class NewMicroreactProjectRequestData:
    workspace: str
    mr_access_token: str
    tree_methods: List[str]


PUBLIC_BASE_URL = os.environ.get("PUBLIC_BASE_URL")

def get_microreact_url(user, token_info):
    url = environ.get("MICROREACT_BASE_URL")
    resp = {
        "url": url
    }
    return jsonify(resp)

def send_to_microreact(user, token_info, body: NewMicroreactProjectRequestData):
    workspace_id = body.workspace
    workspace = get_workspace_db(user, workspace_id)

    if workspace is None:
        return abort(404)

    # Calculate tree
    tree_calcs = []
    samples = list(map(lambda s: s["id"], workspace["samples"]))

    with ApiClient(Configuration(host="http://bioapi:8000")) as api_client:
        # Distance
        api_instance = DistancesApi(api_client)
        request = DistanceMatrixRequest(
            seq_collection="samples",
            seqid_field_path="categories.sample_info.summary.sofi_sequence_id",
            profile_field_path="categories.cgmlst.report.alleles",
            seq_mongo_ids=samples,
        )
        distance_post_api_response = (
            api_instance.dmx_from_mongodb_v1_distance_calculations_post(request)
        )
        distance_job_id = distance_post_api_response.job_id
        status = distance_post_api_response.status.value

        while status == "init":
            time.sleep(2)
            distance_get_api_response = (
                api_instance.dmx_result_v1_distance_calculations_dc_id_get(
                    distance_job_id
                )
            )
            status = distance_get_api_response.status.value

        if status == "error":
            return abort(500)

        # Trees
        api_instance = TreesApi(api_client)
        tree_calcs = []
        for tree_method in body.tree_methods:
            request = HCTreeCalcRequest(dmx_job=distance_job_id, method=tree_method)
            trees_post_api_response = api_instance.hc_tree_from_dmx_job_v1_trees_post(
                request
            )
            job_id = trees_post_api_response.job_id
            status = trees_post_api_response.status.value
            result: Union[StrictStr, None] = None

            while status == "init":
                time.sleep(2)
                trees_get_api_response = api_instance.hc_tree_result_v1_trees_tc_id_get(
                    job_id
                )
                status = trees_get_api_response.status.value
                result = trees_get_api_response.result

            if status == "error":
                return abort(500, description=result)

            tree_calcs.append({"method": tree_method, "result": result})

    # Create microreact project
    data = get_workspace_data_db(user, token_info, workspace_id)

    if data is None:
        return abort(404)

    cols = authorized_columns(token_info)
    
    hidden_columns = get_hidden_columns(token_info["institution"], cols)

    res = new_microreact_project(
        project_name=workspace["name"],
        metadata_url=f"{PUBLIC_BASE_URL}/api/workspaces/{workspace_id}/data",  # get_workspace_data
        columns=cols,
        mr_access_token=body.mr_access_token,
        mr_base_url="http://microreact:3000/",
        tree_calcs=tree_calcs,
        hidden=hidden_columns
    )

    json_response = res.json()

    microreact_reference = {
        "id": workspace_id,
        "microreact": {"id": json_response["id"], "url": json_response["url"]},
    }

    update_microreact_db(microreact_reference)

    return jsonify(json_response)

def get_hidden_columns(institution: str, all_cols):
    if institution == "SSI":
        relevant_columns = ["isolate_id", "date_sample", "primary_isolate", "gender", "age", "travel_country", "kma", "fud_number", "cluster_id", "date_epi", "species_final", "st_final", "serotype_final", "toxins_final", "amr_profile"]
    elif institution == "FVST":
        relevant_columns = ["sampling_date", "institution", "provided_species", "animal_species", "run_id", "isolate_id", "fud_number", "cluster_id", "serotype_final", "st", "infection_source", "comment_cluster", "sequence_id", "sequence_filename", "chr_number", "aut_number", "origin_country", "species_final", "subspecies", "pathotype_final", "virulence_genes", "adhesion_final", "toxins_final", "resistance_genes", "qc_final", "qc_provided_species", "qc_genome1x", "qc_genome10x", "qc_gsize_diff1x10", "qc_avg_coverage", "qc_num_contigs", "qc_ambiguous_sites", "qc_num_reads", "qc_cgmlst_percent", "cgmlst_schema_salmonella", "cgmlst_schema_ecoli", "cgmlst_schema_campylobacter", "cgmlst_schema_listeria", "cgmlst_schema_klebsiella"]
    else:
        relevant_columns = [""]
    return [x for x in all_cols if x not in relevant_columns]
    