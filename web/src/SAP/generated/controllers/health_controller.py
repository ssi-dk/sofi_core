import connexion
import six

from .. import util
from ...src.controllers import HealthController

def health_ext_lims(user, token_info):  # noqa: E501
    """health_ext_lims

     # noqa: E501


    :rtype: HealthResponse
    """
    return HealthController.health_ext_lims(user, token_info)

def health_ext_tbr(user, token_info):  # noqa: E501
    """health_ext_tbr

     # noqa: E501


    :rtype: HealthResponse
    """
    return HealthController.health_ext_tbr(user, token_info)
