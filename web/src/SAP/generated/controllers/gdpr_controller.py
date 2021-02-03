import connexion
import six

from web.src.SAP.generated.models.personal_data import PersonalData  # noqa: E501
from web.src.SAP.generated.models.personal_identifier_type import PersonalIdentifierType  # noqa: E501
from .. import util
from ...src.controllers import GdprController

def extract_data_from_pi(user, token_info, identifier_type, identifier):  # noqa: E501
    """extract_data_from_pi

    Extract all data given a personal identifier # noqa: E501

    :param identifier_type: Identifier type
    :type identifier_type: dict | bytes
    :param identifier: Personal identifier number.
    :type identifier: str

    :rtype: PersonalData
    """
    if connexion.request.is_json:
        identifier_type =  PersonalIdentifierType.from_dict(connexion.request.get_json())  # noqa: E501
    return GdprController.extract_data_from_pi(user, token_info, identifier_type, identifier)
