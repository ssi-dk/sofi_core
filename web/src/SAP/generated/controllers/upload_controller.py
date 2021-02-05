import connexion
import six

from web.src.SAP.generated.models.base_metadata import BaseMetadata  # noqa: E501
from .. import util
from ...src.controllers import UploadController

def bulk_metadata(user, token_info, metadata_tsv):  # noqa: E501
    """bulk_metadata

    Manually upload metadata for previously uploaded sequence files # noqa: E501

    :param metadata_tsv: 
    :type metadata_tsv: str

    :rtype: None
    """
    return UploadController.bulk_metadata(user, token_info, metadata_tsv)

def multi_upload(user, token_info, metadata_tsv, files):  # noqa: E501
    """multi_upload

    Manually upload multiple sequences with metadata # noqa: E501

    :param metadata_tsv: 
    :type metadata_tsv: str
    :param files: 
    :type files: List[str]

    :rtype: None
    """
    return UploadController.multi_upload(user, token_info, metadata_tsv, files)

def single_upload(user, token_info, metadata, file):  # noqa: E501
    """single_upload

    Manually upload isolate with metadata # noqa: E501

    :param metadata: 
    :type metadata: dict | bytes
    :param file: 
    :type file: str

    :rtype: None
    """
    if connexion.request.is_json:
        metadata = BaseMetadata.from_dict(connexion.request.get_json())  # noqa: E501
    return UploadController.single_upload(user, token_info, metadata, file)
