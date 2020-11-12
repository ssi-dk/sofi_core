import connexion
import six

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
