import connexion
import six

from .. import util
from ...src.controllers import ComparativeAnalysisController

def get_comparative_newick_data(user, token_info, job_id):  # noqa: E501
    """get_comparative_newick_data

    Get newick tree file along with metadata for a given job id. # noqa: E501

    :param job_id: Job id that points to the comparative analysis run.
    :type job_id: str

    :rtype: NewickTreeResponse
    """
    return ComparativeAnalysisController.get_comparative_newick_data(user, token_info, job_id)
