import connexion
import six

from .. import util
from ...src.controllers import SamplesController

def add_to_cluster(user, token_info, add_to_cluster=None):  # noqa: E501
    """add_to_cluster

     # noqa: E501

    :param add_to_cluster: 
    :type add_to_cluster: dict | bytes

    :rtype: None
    """
    if connexion.request.is_json:
        from ..models import AddToCluster
        add_to_cluster = AddToCluster.from_dict(connexion.request.get_json())  # noqa: E501
    return SamplesController.add_to_cluster(user, token_info, add_to_cluster)

def get_sample_by_id(user, token_info, sample_id):  # noqa: E501
    """get_sample_by_id

    Get an individual sample by id # noqa: E501

    :param sample_id: id of sample
    :type sample_id: str

    :rtype: Sample
    """
    return SamplesController.get_sample_by_id(user, token_info, sample_id)
