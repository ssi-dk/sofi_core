import connexion
import six

from .. import util
from ...src.controllers import WorkspacesController

def get_workspaces(user, token_info):  # noqa: E501
    """get_workspaces

    Gets workspaces # noqa: E501


    :rtype: List[Workspace]
    """
    return WorkspacesController.get_workspaces(user, token_info)
