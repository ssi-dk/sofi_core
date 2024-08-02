from dataclasses import dataclass
import time
from typing import Union
from flask import abort
from flask.json import jsonify
from pydantic import StrictStr

from ...generated.models.tree_method import TreeMethod
from .....microreact_integration.functions import new_project as new_microreact_project
from ..repositories.workspaces import get_workspace as get_workspace_db
from ..repositories.workspaces import update_microreact as update_microreact_db
from ..security.permission_check import (authorized_columns)
from ....services.bio_api.openapi.api.distances_api import DistancesApi
from ....services.bio_api.openapi.api.trees_api import TreesApi
from ....services.bio_api.openapi.api_client import ApiClient
from ....services.bio_api.openapi.configuration import Configuration
from ....services.bio_api.openapi.models.distance_matrix_request import DistanceMatrixRequest
from ....services.bio_api.openapi.models.hc_tree_calc_request import HCTreeCalcRequest

@dataclass
class NewMicroreactProjectRequestData:
    workspace: str
    mr_access_token: str
    tree_method: str

def send_to_microreact(user, token_info, body: NewMicroreactProjectRequestData):
    workspace_id = body.workspace
    workspace = get_workspace_db(user, workspace_id)

    if workspace is None:
        return abort(404)

    # Calculate tree
    tree_calcs=[]
    samples = list(map(lambda s: s["id"], workspace["samples"]))

    with ApiClient(Configuration(host="http://bio_api:8000")) as api_client:
        # Distance
        api_instance = DistancesApi(api_client)
        request = DistanceMatrixRequest(seq_collection="samples",
                                        seqid_field_path="categories.sample_info.summary.sofi_sequence_id",
                                        profile_field_path="categories.cgmlst.report.alleles",
                                        seq_mongo_ids=samples)
        distance_post_api_response = api_instance.dmx_from_mongodb_v1_distance_calculations_post(request)
        job_id = distance_post_api_response.job_id
        status = distance_post_api_response.status.value

        while status == "init":
            time.sleep(2)
            distance_get_api_response = api_instance.dmx_result_v1_distance_calculations_dc_id_get(job_id)
            status = distance_get_api_response.status.value

        if status == "error":
            return abort(500)

        # Trees
        api_instance = TreesApi(api_client)
        request = HCTreeCalcRequest(dmx_job=job_id, method=body.tree_method)
        trees_post_api_response = api_instance.hc_tree_from_dmx_job_v1_trees_post(request)
        job_id = trees_post_api_response.job_id
        status = trees_post_api_response.status.value
        result: Union[StrictStr, None] = None

        while status == "init":
            time.sleep(2)
            trees_get_api_response = api_instance.hc_tree_result_v1_trees_tc_id_get(job_id)
            status = trees_get_api_response.status.value
            result = trees_get_api_response.result

        if status == "error":
            return abort(500, description=result)

        tree_calcs = [{"method": body.tree_method, "result": result}]

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

    json_response = res.json()

    microreact_reference = {
        "id": workspace_id,
        "microreact": {
            "id": json_response["id"],
            "url": json_response["url"]
        }
    }

    update_microreact_db(microreact_reference)

    return jsonify(json_response)
