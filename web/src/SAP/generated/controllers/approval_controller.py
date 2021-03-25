import connexion
import six

from .. import util
from ...src.controllers import ApprovalController

def cancel_approval(user, token_info, approval_id):  # noqa: E501
    """cancel_approval

    Cancel a pending approval # noqa: E501

    :param approval_id: Id of approval to cancel
    :type approval_id: str

    :rtype: None
    """
    return ApprovalController.cancel_approval(user, token_info, approval_id)

def create_approval(user, token_info, body=None):  # noqa: E501
    """create_approval

    Submit approval/rejection information # noqa: E501

    :param body: 
    :type body: dict | bytes

    :rtype: Approval
    """
    if connexion.request.is_json:
        import ApprovalRequest
        body = ApprovalRequest.from_dict(connexion.request.get_json())  # noqa: E501
    return ApprovalController.create_approval(user, token_info, body)

def full_approval_matrix(user, token_info):  # noqa: E501
    """full_approval_matrix

    Get the entire approval matrix for all analysis # noqa: E501


    :rtype: Dict[str, Dict[str, ApprovalStatus]]
    """
    return ApprovalController.full_approval_matrix(user, token_info)

def get_approvals(user, token_info):  # noqa: E501
    """get_approvals

    Retrieve list of approvals for authenticated user # noqa: E501


    :rtype: List[Approval]
    """
    return ApprovalController.get_approvals(user, token_info)
