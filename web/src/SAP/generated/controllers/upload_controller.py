import connexion
import six

from .. import util
from ...src.controllers import UploadController

def bulk_metadata(user, token_info, path, metadata_tsv):  # noqa: E501
    """bulk_metadata

    Manually upload metadata for previously uploaded sequence files # noqa: E501

    :param path: 
    :type path: str
    :param metadata_tsv: 
    :type metadata_tsv: str

    :rtype: UploadResponse
    """
    return UploadController.bulk_metadata(user, token_info, path, metadata_tsv)

def multi_upload(user, token_info, metadata_tsv, files):  # noqa: E501
    """multi_upload

    Manually upload multiple sequences with metadata # noqa: E501

    :param metadata_tsv: 
    :type metadata_tsv: str
    :param files: 

    :rtype: UploadResponse
    """
    return UploadController.multi_upload(user, token_info, metadata_tsv, files)

def single_upload(user, token_info, metadata, files):  # noqa: E501
    """single_upload

    Manually upload isolate with metadata # noqa: E501

    :param metadata: 
    :type metadata: dict | bytes
    :param files: 

    :rtype: UploadResponse
    """
    if connexion.request.is_json:
        from ..models import BaseMetadata
        metadata = BaseMetadata.from_dict(connexion.request.get_json())  # noqa: E501
    return UploadController.single_upload(user, token_info, metadata, files)
