import connexion
import six

from web.src.SAP.generated.models.analysis_query import AnalysisQuery  # noqa: E501
from web.src.SAP.generated.models.column import Column  # noqa: E501
from web.src.SAP.generated.models.page_of_analysis import PageOfAnalysis  # noqa: E501
from .. import util
from ...src.controllers import AnalysisController


def get_analysis(paging_token=None, page_size=None):  # noqa: E501
    """get_analysis

    Page through all the analysis in the system (WIP) # noqa: E501

    :param paging_token: opaque token to supply to get the next page of isolates
    :type paging_token: str
    :param page_size: 
    :type page_size: 

    :rtype: PageOfAnalysis
    """
    return AnalysisController.get_analysis(paging_token, page_size)


def get_columns():  # noqa: E501
    """get_columns

    Get column metadata, scoped to authenticated user # noqa: E501


    :rtype: List[Column]
    """
    return AnalysisController.get_columns()


def search_analysis(query=None):  # noqa: E501
    """search_analysis

    Search all analysis by given query # noqa: E501

    :param query: 
    :type query: dict | bytes

    :rtype: PageOfAnalysis
    """
    if connexion.request.is_json:
        query = AnalysisQuery.from_dict(connexion.request.get_json())  # noqa: E501
    return AnalysisController.search_analysis(query)
