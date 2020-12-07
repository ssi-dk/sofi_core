import connexion
import six

from web.src.SAP.generated.models.user import User  # noqa: E501
from web.src.SAP.generated.models.user_defined_view import UserDefinedView  # noqa: E501
from .. import util
from ...src.controllers import UserController


def create_user(body):  # noqa: E501
    """Create user

    This can only be done by the logged in user. # noqa: E501

    :param body: Created user object
    :type body: dict | bytes

    :rtype: None
    """
    if connexion.request.is_json:
        body = User.from_dict(connexion.request.get_json())  # noqa: E501
    return UserController.create_user(body)


def create_user_view(user_defined_view=None):  # noqa: E501
    """create_user_view

     # noqa: E501

    :param user_defined_view: 
    :type user_defined_view: dict | bytes

    :rtype: List[UserDefinedView]
    """
    if connexion.request.is_json:
        user_defined_view = UserDefinedView.from_dict(connexion.request.get_json())  # noqa: E501
    return UserController.create_user_view(user_defined_view)


def delete_user(username):  # noqa: E501
    """Delete user

    This can only be done by the logged in user. # noqa: E501

    :param username: The name that needs to be deleted
    :type username: str

    :rtype: None
    """
    return UserController.delete_user(username)


def delete_view(name):  # noqa: E501
    """delete_view

    Cancel a pending approval # noqa: E501

    :param name: Name of view to delete
    :type name: str

    :rtype: None
    """
    return UserController.delete_view(name)


def get_user_by_name(username):  # noqa: E501
    """Get user by user name

     # noqa: E501

    :param username: The name that needs to be fetched. Use user1 for testing. 
    :type username: str

    :rtype: User
    """
    return UserController.get_user_by_name(username)


def get_user_views():  # noqa: E501
    """get_user_views

     # noqa: E501


    :rtype: List[UserDefinedView]
    """
    return UserController.get_user_views()


def login_user(username, password):  # noqa: E501
    """Logs user into the system

     # noqa: E501

    :param username: The user name for login
    :type username: str
    :param password: The password for login in clear text
    :type password: str

    :rtype: str
    """
    return UserController.login_user(username, password)


def logout_user():  # noqa: E501
    """Logs out current logged in user session

     # noqa: E501


    :rtype: None
    """
    return UserController.logout_user()


def update_user(username, body):  # noqa: E501
    """Updated user

    This can only be done by the logged in user. # noqa: E501

    :param username: name that need to be updated
    :type username: str
    :param body: Updated user object
    :type body: dict | bytes

    :rtype: None
    """
    if connexion.request.is_json:
        body = User.from_dict(connexion.request.get_json())  # noqa: E501
    return UserController.update_user(username, body)
