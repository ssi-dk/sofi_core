import connexion
import six

from .. import util
from ...src.controllers import ProjectsController

def get_projects(user, token_info):  # noqa: E501
    """get_projects

    Gets projects available to user # noqa: E501


    :rtype: List[Project]
    """
    return ProjectsController.get_projects(user, token_info)

def set_is_private(user, token_info, project_key, is_private):  # noqa: E501
    """set_is_private

    Sets the private value of a project # noqa: E501

    :param project_key: project_key of modified project
    :type project_key: str
    :param is_private: boolean value to set the is_private field
    :type is_private: bool

    :rtype: None
    """
    return ProjectsController.set_is_private(user, token_info, project_key, is_private)
