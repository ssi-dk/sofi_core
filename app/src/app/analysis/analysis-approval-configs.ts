import {
  createApproval,
  ApprovalRequest,
  Approval,
  CancelApprovalRequest,
  cancelApproval,
  getApprovals,
} from "sap-client";
import { getUrl } from "service";

export type ApprovalSlice = {
  approvals: Array<Approval>;
};

export const sendApproval = (params: ApprovalRequest) => {
  // use generated api client as base
  const base = createApproval<ApprovalSlice>({body: params});
  // template the full path for the url
  base.url = getUrl(base.url);
  // define a transform for normalizing the data into our desired state
  base.transform = (response: Approval) => ({
    approvals: [response],
  });
  // define the update strategy for our state
  base.update = {
    approvals: (oldValue, newValue) => [...newValue, ...oldValue || []],
  };
  return base;
};

export const rejectApproval = (params: CancelApprovalRequest) => {
  // use generated api client as base
  const base = cancelApproval<ApprovalSlice>(params);
  // template the full path for the url
  base.url = getUrl(base.url);
  // define the update strategy for our state
  base.update = {
    approvals: (oldValue, _) => oldValue.filter((x) => x.id !== params.id),
  };
  return base;
};

export const fetchApprovals = () => {
  const base = getApprovals<ApprovalSlice>();

  base.url = getUrl(base.url);

  base.transform = (response: Array<Approval>) => ({
    approvals: response,
  });

  base.update = {
    approvals: (_, newValue) => newValue,
  };
  return base;
};
