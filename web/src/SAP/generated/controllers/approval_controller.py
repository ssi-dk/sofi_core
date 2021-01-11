import connexion
import six

from web.src.SAP.generated.models.approval import Approval  # noqa: E501
from web.src.SAP.generated.models.approval_request import ApprovalRequest  # noqa: E501
from .. import util
from ...src.controllers import ApprovalController


def cancel_approval(approval_id):  # noqa: E501
    """cancel_approval

    Cancel a pending approval # noqa: E501

    :param approval_id: Id of approval to cancel
    :type approval_id: str

    :rtype: None
    """
    return ApprovalController.cancel_approval(approval_id)


def create_approval(body=None):  # noqa: E501
    """create_approval

    Submit approval/rejection information # noqa: E501

    :param body: 
    :type body: dict | bytes

    :rtype: Approval
    """
    if connexion.request.is_json:
        body = ApprovalRequest.from_dict(connexion.request.get_json())  # noqa: E501
    return ApprovalController.create_approval(body)


def full_approval_matrix():  # noqa: E501
    """full_approval_matrix

    Get the entire approval matrix for all analysis # noqa: E501


    :rtype: Dict[str, Dict[str, ApprovalStatus]]
    """
    return ApprovalController.full_approval_matrix()


def get_approvals():  # noqa: E501
    """get_approvals

    Retrieve list of approvals for authenticated user # noqa: E501


    :rtype: List[Approval]
    """
    return ApprovalController.get_approvals()
