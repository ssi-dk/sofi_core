import connexion
import six

from .. import util
from ...src.controllers import SamplesController

def get_sample_by_id(user, token_info, sample_id):  # noqa: E501
    """get_sample_by_id

    Get an individual sample by id # noqa: E501

    :param sample_id: id of sample
    :type sample_id: str

    :rtype: Sample
    """
    return SamplesController.get_sample_by_id(user, token_info, sample_id)
