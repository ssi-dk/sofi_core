import connexion
import six

from .. import util
from ...src.controllers import MicroreactController

def send_to_microreact(user, token_info, new_microreact_project_request):  # noqa: E501
    """send_to_microreact

    Send to Microreact # noqa: E501

    :param new_microreact_project_request: 
    :type new_microreact_project_request: dict | bytes

    :rtype: NewMicroreactProjectResponse
    """
    if connexion.request.is_json:
        from ..models import NewMicroreactProjectRequest
        new_microreact_project_request = NewMicroreactProjectRequest.from_dict(connexion.request.get_json())  # noqa: E501
    return MicroreactController.send_to_microreact(user, token_info, new_microreact_project_request)
