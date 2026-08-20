import connexion
import six

from .. import util
from ...src.controllers import WorkspacesController

def clone_workspace(user, token_info, clone_workspace=None):  # noqa: E501
    """clone_workspace

     # noqa: E501

    :param clone_workspace: 
    :type clone_workspace: dict | bytes

    :rtype: None
    """
    if connexion.request.is_json:
        from ..models import CloneWorkspace
        clone_workspace = CloneWorkspace.from_dict(connexion.request.get_json())  # noqa: E501
    return WorkspacesController.clone_workspace(user, token_info, clone_workspace)

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

def create_workspace_from_sequence_ids(user, token_info, create_workspace=None):  # noqa: E501
    """create_workspace_from_sequence_ids

     # noqa: E501

    :param create_workspace: 
    :type create_workspace: dict | bytes

    :rtype: None
    """
    if connexion.request.is_json:
        from ..models import CreateWorkspace
        create_workspace = CreateWorkspace.from_dict(connexion.request.get_json())  # noqa: E501
    return WorkspacesController.create_workspace_from_sequence_ids(user, token_info, create_workspace)

def delete_workspace_sample(user, token_info, workspace_id, sample_id):  # noqa: E501
    """delete_workspace_sample

    Delete sample from workspace # noqa: E501

    :param workspace_id: Id of workspace to modify
    :type workspace_id: str
    :param sample_id: Id of the sample to remove
    :type sample_id: str

    :rtype: None
    """
    return WorkspacesController.delete_workspace_sample(user, token_info, workspace_id, sample_id)

def get_tags(user, token_info):  # noqa: E501
    """get_tags

    Get all tags used in institution # noqa: E501


    :rtype: List[str]
    """
    return WorkspacesController.get_tags(user, token_info)

def get_workspace(user, token_info, workspace_id):  # noqa: E501
    """get_workspace

    Get an existing workspace # noqa: E501

    :param workspace_id: Id of workspace to get
    :type workspace_id: str

    :rtype: WorkspaceInfo
    """
    return WorkspacesController.get_workspace(user, token_info, workspace_id)

def get_workspace_data(user, token_info, workspace_id):  # noqa: E501
    """get_workspace_data

    Get an workspace data # noqa: E501

    :param workspace_id: Id of workspace to get
    :type workspace_id: str

    :rtype: List[List[AnyType]]
    """
    return WorkspacesController.get_workspace_data(user, token_info, workspace_id)

def get_workspaces(user, token_info):  # noqa: E501
    """get_workspaces

    Gets workspaces # noqa: E501


    :rtype: List[Workspace]
    """
    return WorkspacesController.get_workspaces(user, token_info)

def join_workspace(user, token_info, workspace_id):  # noqa: E501
    """join_workspace

    Join an existing workspace # noqa: E501

    :param workspace_id: Id of workspace to join
    :type workspace_id: str

    :rtype: None
    """
    return WorkspacesController.join_workspace(user, token_info, workspace_id)

def leave_workspace(user, token_info, workspace_id):  # noqa: E501
    """leave_workspace

    Leave an existing workspace # noqa: E501

    :param workspace_id: Id of workspace to delete
    :type workspace_id: str

    :rtype: None
    """
    return WorkspacesController.leave_workspace(user, token_info, workspace_id)

def post_workspace(user, token_info, workspace_id, update_workspace=None):  # noqa: E501
    """post_workspace

    Updates an existing workspace # noqa: E501

    :param workspace_id: Id of workspace to update
    :type workspace_id: str
    :param update_workspace: 
    :type update_workspace: dict | bytes

    :rtype: None
    """
    if connexion.request.is_json:
        from ..models import UpdateWorkspace
        update_workspace = UpdateWorkspace.from_dict(connexion.request.get_json())  # noqa: E501
    return WorkspacesController.post_workspace(user, token_info, workspace_id, update_workspace)

def remove_workspace_samples(user, token_info, workspace_id, update_workspace=None):  # noqa: E501
    """remove_workspace_samples

    Remove samples from workspace # noqa: E501

    :param workspace_id: Id of workspace to update
    :type workspace_id: str
    :param update_workspace: 
    :type update_workspace: dict | bytes

    :rtype: None
    """
    if connexion.request.is_json:
        from ..models import UpdateWorkspace
        update_workspace = UpdateWorkspace.from_dict(connexion.request.get_json())  # noqa: E501
    return WorkspacesController.remove_workspace_samples(user, token_info, workspace_id, update_workspace)

def set_tag(user, token_info, set_ws_tag=None):  # noqa: E501
    """set_tag

    Add or remove a tag from a workspace # noqa: E501

    :param set_ws_tag: 
    :type set_ws_tag: dict | bytes

    :rtype: None
    """
    if connexion.request.is_json:
        from ..models import SetWsTag
        set_ws_tag = SetWsTag.from_dict(connexion.request.get_json())  # noqa: E501
    return WorkspacesController.set_tag(user, token_info, set_ws_tag)

def set_ws_favorite(user, token_info, set_favorite=None):  # noqa: E501
    """set_ws_favorite

    Add or remove the user from this workspaces&#39; favorite list # noqa: E501

    :param set_favorite: 
    :type set_favorite: dict | bytes

    :rtype: None
    """
    if connexion.request.is_json:
        from ..models import SetFavorite
        set_favorite = SetFavorite.from_dict(connexion.request.get_json())  # noqa: E501
    return WorkspacesController.set_ws_favorite(user, token_info, set_favorite)

def ws_search(user, token_info, workspace_search_query=None):  # noqa: E501
    """ws_search

    Search for a workspace with a search query # noqa: E501

    :param workspace_search_query: 
    :type workspace_search_query: dict | bytes

    :rtype: List[Workspace]
    """
    if connexion.request.is_json:
        from ..models import WorkspaceSearchQuery
        workspace_search_query = WorkspaceSearchQuery.from_dict(connexion.request.get_json())  # noqa: E501
    return WorkspacesController.ws_search(user, token_info, workspace_search_query)
