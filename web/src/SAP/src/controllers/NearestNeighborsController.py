import sys
import time
from web.src.SAP.generated.models.nearest_neighbors_request import NearestNeighborsRequest
from web.src.SAP.src.repositories.analysis import get_analysis_with_metadata, get_single_analysis_by_object_id
from web.src.SAP.src.repositories.samples import get_single_sample_by_object_id
from web.src.SAP.src.security.permission_check import assert_user_has
from web.src.services.bio_api.openapi.api.nearest_neighbors_api import NearestNeighborsApi
from web.src.services.bio_api.openapi.api_client import ApiClient
from web.src.services.bio_api.openapi.configuration import Configuration
from web.src.services.bio_api.openapi.model.nearest_neighbors_request import NearestNeighborsRequest as BioNearestNeighborsRequest

from flask.json import jsonify

def post(user, token, body: NearestNeighborsRequest):
    assert_user_has("search", token)
    
    with ApiClient(Configuration(host="http://bio_api:8000")) as api_client:
        sample = get_single_sample_by_object_id(body.id)
        detected_species = sample["categories"]["species_detection"]["summary"]["detected_species"]

        api_instance = NearestNeighborsApi(api_client)
        filtering = {"categories.species_detection.summary.detected_species": detected_species}
        request = BioNearestNeighborsRequest("samples", filtering, "categories.cgmlst.report.alleles", body.id, body.cutoff, body.unknowns_are_diffs)
        api_response = api_instance.nearest_neighbors_v1_nearest_neighbors_post(request)

        job_id = api_response.job_id
        status = api_response.status.value
        
        while status == "init":
            time.sleep(2)
            api_response = api_instance.nn_result_v1_nearest_neighbors_nn_id_get(job_id)
            status = api_response.status

        if status == "error":
            return jsonify({"status": "error"})

        response_dict = api_response.to_dict()

        def get_result(id: str):
            row = get_single_analysis_by_object_id(id)

            if (
                token["sofi-data-clearance"] == "own-institution"
                and token["institution"] != row["institution"]
            ):
                return None
            return get_analysis_with_metadata(row["sequence_id"])
        
        result = list(filter(lambda x: x is not None, list(map(lambda r : get_result(r["id"]), response_dict["result"]))))
        
        return jsonify({"status": api_response.status.value, 
                        "jobId": api_response.job_id, 
                        "createdAt": api_response.created_at,
                        "result": result })
