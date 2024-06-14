import sys
import time
from flask import abort
from flask.json import jsonify
from web.src.services.bio_api.openapi.api.distances_api import DistancesApi
from web.src.services.bio_api.openapi.api.nearest_neighbors_api import NearestNeighborsApi
from web.src.services.bio_api.openapi.api.trees_api import TreesApi
from web.src.services.bio_api.openapi.api_client import ApiClient
from web.src.services.bio_api.openapi.configuration import Configuration
from web.src.services.bio_api.openapi.model.distance_matrix_request import DistanceMatrixRequest
from web.src.services.bio_api.openapi.model.hc_tree_calc_request import HCTreeCalcRequest
from ..repositories.workspaces import get_workspaces as get_workspaces_db
from ..repositories.workspaces import delete_workspace as delete_workspace_db
from ..repositories.workspaces import delete_workspace_sample as delete_workspace_sample_db
from ..repositories.workspaces import create_workspace as create_workspace_db
from ..repositories.workspaces import update_workspace as update_workspace_db
from ..repositories.workspaces import get_workspace as get_workspace_db

def get_workspaces(user, token_info):
    return jsonify(get_workspaces_db(user))

def delete_workspace(user, token_info, workspace_id: str):
    res = delete_workspace_db(user, workspace_id)
    return None if res.deleted_count > 0 else abort(404)

def create_workspace(user, token_info, body):
    res = create_workspace_db(user, body)

    if (res.upserted_id):
        return jsonify({"id": str(res.upserted_id)})
    
    return jsonify(body)

def post_workspace(user, token_info, workspace_id: str, body):
    update_workspace_db(user, workspace_id, body)

    return jsonify(body)

def get_workspace(user, token_info, workspace_id: str):
    return jsonify(get_workspace_db(user, workspace_id))

def delete_workspace_sample(user, token_info, workspace_id, sample_id):
    res = delete_workspace_sample_db(user, workspace_id, sample_id)
    return None if res.modified_count > 0 else abort(404)

def build_workspace_tree(user, token_info, workspace_id, body):
    workspace = get_workspace_db(user, workspace_id)
    samples = list(map(lambda s: s["id"], workspace["samples"]))

    with ApiClient(Configuration(host="http://bio_api:8000")) as api_client:
        # Distance
        api_instance = DistancesApi(api_client)
        request = DistanceMatrixRequest("samples", "_id", "categories.cgmlst.report.alleles", samples)
        api_response = api_instance.dmx_from_mongodb_v1_distance_calculations_post(request)
        job_id = api_response["job_id"]
        status = api_response.status.value
        
        while status == "init":
            time.sleep(2)
            api_response = api_instance.dmx_result_v1_distance_calculations_dc_id_get(job_id)
            status = api_response.status

        if status == "error":
            abort(500)

        # Trees
        api_instance = TreesApi(api_client)
        request = HCTreeCalcRequest(job_id, body.tree_method)
        api_response = api_instance.hc_tree_from_dmx_job_v1_trees_post(request)
        job_id = api_response["job_id"]
        status = api_response.status.value
        
        while status == "init":
            time.sleep(2)
            api_response = api_instance.hc_tree_result_v1_trees_tc_id_get(job_id)
            status = api_response.status

        if status == "error":
            abort(500)

        return api_response.response
