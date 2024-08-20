import sys, os, time
from flask import abort
from flask.json import jsonify
from .....microreact_integration.functions import new_project as new_microreact_project
from ..repositories.workspaces import get_workspace as get_workspace_db
from ..repositories.workspaces import update_microreact as update_microreact_db
from ..security.permission_check import (authorized_columns)
from ....services.bio_api.openapi.api.distances_api import DistancesApi
from ....services.bio_api.openapi.api.trees_api import TreesApi
from ....services.bio_api.openapi.api_client import ApiClient
from ....services.bio_api.openapi.configuration import Configuration
from ....services.bio_api.openapi.model.distance_matrix_request import DistanceMatrixRequest
from ....services.bio_api.openapi.model.hc_tree_calc_request import HCTreeCalcRequest

def send_to_microreact(user, token_info, body):
    workspace_id = body.workspace
    workspace = get_workspace_db(user, workspace_id)

    # Calculate tree
    tree_calcs=[]
    samples = list(map(lambda s: s["id"], workspace["samples"]))

    with ApiClient(Configuration(host="http://bioapi:8000")) as api_client:
        # Distance
        api_instance = DistancesApi(api_client)
        request = DistanceMatrixRequest("samples", "categories.sample_info.summary.sofi_sequence_id", "categories.cgmlst.report.alleles", samples)
        api_response = api_instance.dmx_from_mongodb_v1_distance_calculations_post(request)
        job_id = api_response["job_id"]
        status = api_response.status.value
        
        while status == "init":
            time.sleep(2)
            api_response = api_instance.dmx_result_v1_distance_calculations_dc_id_get(job_id)
            status = api_response.status.value

        if status == "error":
            return abort(500)

        # Trees
        api_instance = TreesApi(api_client)
        request = HCTreeCalcRequest(job_id, body.tree_method)
        api_response = api_instance.hc_tree_from_dmx_job_v1_trees_post(request)
        job_id = api_response["job_id"]
        status = api_response.status.value
        
        while status == "init":
            time.sleep(2)
            api_response = api_instance.hc_tree_result_v1_trees_tc_id_get(job_id)
            status = api_response.status.value

        if status == "error":
            return abort(500, description=api_response.result)

        tree_calcs = [{"method": body.tree_method, "result": api_response.result}]

    # Create microreact project
    authorized = authorized_columns(token_info)

    values = []
    for sample in workspace["samples"]:
        row = []
        for column in authorized:
            if column in sample:
                row.append(sample[column])
            else:
                row.append("")
        values.append(row)
    
    res = new_microreact_project(        
        project_name=workspace["name"],
        tree_calcs=tree_calcs,
        metadata_keys=authorized,
        metadata_values=values,
        mr_access_token=body.mr_access_token,
        mr_base_url="http://microreact:3000/"
        )
        
    jsonResponse = res.json()

    microreactReference = {
        "id": workspace_id,
        "microreact": {
            "id": jsonResponse["id"],
            "url": jsonResponse["url"]
        }
    }

    update_microreact_db(microreactReference)

    return jsonify(jsonResponse)
