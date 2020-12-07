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

type Judgement = "approve" | "reject";

const sendJudgement = (params: ApprovalRequest, judgement: Judgement) => {
  const clone = JSON.parse(JSON.stringify(params));
  const keys = Object.keys(clone.matrix);
  // eslint-disable-next-line
  for (const k of keys) {
    // eslint-disable-next-line
    for (const f of Object.keys(clone.matrix[k])) {
      if (judgement === "approve") {
        if (!clone.matrix[k][f]) {
          // remove any negatives that showed up due to toggle on/off
          delete clone.matrix[k][f];
        }
      } else if (judgement === "reject") {
        if (clone.matrix[k][f]) {
          // if rejecting, positive selection means remove, so flip the bool
          clone.matrix[k][f] = false;
        }
      }
    }
  }
  // use generated api client as base
  const base = createApproval<ApprovalSlice>({body: clone});
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

export const sendApproval = (params: ApprovalRequest) => sendJudgement(params, "approve");

export const sendRejection = (params: ApprovalRequest) => sendJudgement(params, "reject");

export const revokeApproval = (params: CancelApprovalRequest) => {
  // use generated api client as base
  const base = cancelApproval<ApprovalSlice>(params);
  // template the full path for the url
  base.url = getUrl(base.url);
  // define the update strategy for our state
  base.update = {
    approvals: (oldValue) => oldValue.filter((x) => x.id !== params.id),
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
