import connexion
import six

from .. import util
from ...src.controllers import NearestNeighborsController

def post(user, token_info, body):  # noqa: E501
    """post

    Nearest Neighbors # noqa: E501

    :param body: 
    :type body: dict | bytes

    :rtype: BioApiJobResponse
    """
    if connexion.request.is_json:
        from ..models import NearestNeighborsRequest
        body = NearestNeighborsRequest.from_dict(connexion.request.get_json())  # noqa: E501
    return NearestNeighborsController.post(user, token_info, body)
