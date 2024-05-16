from web.src.SAP.generated.models.nearest_neighbors_request import NearestNeighborsRequest
from web.src.services.bio_api.openapi.api.nearest_neighbors_api import NearestNeighborsApi
from web.src.services.bio_api.openapi.api_client import ApiClient
from web.src.services.bio_api.openapi.configuration import Configuration
from web.src.services.bio_api.openapi.model.nearest_neighbors_request import NearestNeighborsRequest as BioNearestNeighborsRequest

from flask.json import jsonify

def post(user, token, body: NearestNeighborsRequest):
    with ApiClient(Configuration(host="http://bio_api:8000")) as api_client:
        api_instance = NearestNeighborsApi(api_client)

        request = BioNearestNeighborsRequest("sap_analysis_results", {"species_final": "value"}, "st_alleles", body.id, body.cutoff, False)
        api_response = api_instance.nearest_neighbors_v1_nearest_neighbors_post(request)

        return jsonify(api_response.to_dict())
