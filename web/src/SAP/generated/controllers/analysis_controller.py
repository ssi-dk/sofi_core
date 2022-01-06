import connexion
import six

from .. import util
from ...src.controllers import AnalysisController

def get_analysis(user, token_info, paging_token=None, page_size=None):  # noqa: E501
    """get_analysis

    Page through all the analysis in the system # noqa: E501

    :param paging_token: opaque token to supply to get the next page of isolates
    :type paging_token: str
    :param page_size: 
    :type page_size: 

    :rtype: PageOfAnalysis
    """
    return AnalysisController.get_analysis(user, token_info, paging_token, page_size)

def get_columns(user, token_info):  # noqa: E501
    """get_columns

    Get column metadata, scoped to authenticated user # noqa: E501


    :rtype: List[Column]
    """
    return AnalysisController.get_columns(user, token_info)

def get_sequence_by_id(user, token_info, sequence_id):  # noqa: E501
    """get_sequence_by_id

    Get an individual analysis result by sequence_id # noqa: E501

    :param sequence_id: sequence_id of analysis result
    :type sequence_id: str

    :rtype: AnalysisResult
    """
    return AnalysisController.get_sequence_by_id(user, token_info, sequence_id)

def reload_metadata(user, token_info, body=None):  # noqa: E501
    """reload_metadata

    Reload metadata for a given isolate # noqa: E501

    :param body: 
    :type body: dict | bytes

    :rtype: MetadataReloadResponse
    """
    if connexion.request.is_json:
        from ..models import MetadataReloadRequest
        body = MetadataReloadRequest.from_dict(connexion.request.get_json())  # noqa: E501
    return AnalysisController.reload_metadata(user, token_info, body)

def search_analysis(user, token_info, query=None):  # noqa: E501
    """search_analysis

    Search all analysis by given query # noqa: E501

    :param query: 
    :type query: dict | bytes

    :rtype: PageOfAnalysis
    """
    if connexion.request.is_json:
        from ..models import AnalysisQuery
        query = AnalysisQuery.from_dict(connexion.request.get_json())  # noqa: E501
    return AnalysisController.search_analysis(user, token_info, query)

def submit_changes(user, token_info, body=None):  # noqa: E501
    """submit_changes

    Submit a batch of analysis data changes # noqa: E501

    :param body: 

    :rtype: Dict[str, Dict[str, str]]
    """
    return AnalysisController.submit_changes(user, token_info, body)
