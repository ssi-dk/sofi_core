import connexion
import six

from .. import util
from ...src.controllers import WorkspacesController

def create_workspace(user, token_info, create_workspace=None):  # noqa: E501
    """create_workspace

     # noqa: E501

    :param create_workspace: 
    :type create_workspace: dict | bytes

    :rtype: None
    """
    if connexion.request.is_json:
        from ..models import CreateWorkspace
        create_workspace = CreateWorkspace.from_dict(connexion.request.get_json())  # noqa: E501
    return WorkspacesController.create_workspace(user, token_info, create_workspace)

def delete_workspace(user, token_info, workspace_id):  # noqa: E501
    """delete_workspace

    Delete an existing workspace # noqa: E501

    :param workspace_id: Id of workspace to delete
    :type workspace_id: str

    :rtype: None
    """
    return WorkspacesController.delete_workspace(user, token_info, workspace_id)

def get_workspaces(user, token_info):  # noqa: E501
    """get_workspaces

    Gets workspaces # noqa: E501


    :rtype: List[Workspace]
    """
    return WorkspacesController.get_workspaces(user, token_info)
