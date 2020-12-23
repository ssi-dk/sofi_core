import connexion
import six

from web.src.SAP.generated.models.user_defined_view import UserDefinedView  # noqa: E501
from .. import util
from ...src.controllers import UserController


def create_user_view(user_defined_view=None):  # noqa: E501
    """create_user_view

     # noqa: E501

    :param user_defined_view: 
    :type user_defined_view: dict | bytes

    :rtype: None
    """
    if connexion.request.is_json:
        user_defined_view = UserDefinedView.from_dict(connexion.request.get_json())  # noqa: E501
    return UserController.create_user_view(user_defined_view)


def delete_view(name):  # noqa: E501
    """delete_view

    Delete an existing view # noqa: E501

    :param name: Name of view to delete
    :type name: str

    :rtype: None
    """
    return UserController.delete_view(name)


def get_user_views():  # noqa: E501
    """get_user_views

     # noqa: E501


    :rtype: List[UserDefinedView]
    """
    return UserController.get_user_views()
