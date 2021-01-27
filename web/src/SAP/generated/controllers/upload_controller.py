import connexion
import six

from .. import util
from ...src.controllers import UploadController

def isolate_upload(user, token_info, metadata=None, file=None):  # noqa: E501
    """isolate_upload

    Manually upload isolate with metadata # noqa: E501

    :param metadata: 
    :type metadata: str
    :param file: 
    :type file: str

    :rtype: None
    """
    return UploadController.isolate_upload(user, token_info, metadata, file)
