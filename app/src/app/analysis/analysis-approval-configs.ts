import { deepmerge } from "deepmerge-ts";
import {
  createApproval,
  ApprovalRequest,
  Approval,
  CancelApprovalRequest,
  cancelApproval,
  getApprovals,
  ApprovalStatus,
  ApprovalAllOfStatusEnum,
  fullApprovalMatrix,
} from "sap-client";
import { getUrl } from "service";
import { AnalysisSlice } from "./analysis-query-configs";

export type ApprovalSlice = {
  approvals: Array<Approval>;
  approvalErrors: Array<string>;
};

type ApprovalResponse = {
  success: Approval;
  error: Array<string>;
};

const sendJudgement = (params: ApprovalRequest, judgement: ApprovalStatus) => {
  const clone = JSON.parse(JSON.stringify(params));
  const keys = Object.keys(clone.matrix);
  // eslint-disable-next-line
  for (const k of keys) {
    // eslint-disable-next-line
    for (const f of Object.keys(clone.matrix[k])) {
      if (!clone.matrix[k][f]) {
        // remove any negatives that showed up due to toggle on/off
        delete clone.matrix[k][f];
      } else {
        clone.matrix[k][f] = judgement;
      }
    }
  }
  // use generated api client as base
  const base = createApproval<ApprovalSlice & AnalysisSlice>({ body: clone });
  // template the full path for the url
  base.url = getUrl(base.url);
  // define a transform for normalizing the data into our desired state
  base.transform = (response: ApprovalResponse) => ({
    approvals: [response.success],
    approvalMatrix: response.success.matrix,
    approvalErrors: response.error,
  });
  // define the update strategy for our state
  base.update = {
    approvals: (oldValue, newValue) => [...newValue, ...(oldValue || [])],
    approvalMatrix: (oldValue, newValue) => deepmerge(oldValue, newValue),
    approvalErrors: (_, newValue) => newValue,
  };
  base.force = true;
  return base;
};

export const sendApproval = (params: ApprovalRequest) =>
  sendJudgement(params, ApprovalStatus.approved);

export const sendRejection = (params: ApprovalRequest) =>
  sendJudgement(params, ApprovalStatus.rejected);

export const revokeApproval = (params: CancelApprovalRequest) => {
  // use generated api client as base
  const base = cancelApproval<ApprovalSlice>(params);
  console.log(base);
  // template the full path for the url
  base.url = getUrl(base.url);
  // define the update strategy for our state
  base.update = {
    approvals: (oldValue) => {
      const sequences = params.sequences.split(";");

      const newValue: Approval[] = JSON.parse(JSON.stringify(oldValue));
      const approval = newValue.find(x => x.id === params.approvalId)!

      if (sequences.length < approval.sequence_ids.length){
        // partial revoke
        sequences.forEach(seq => {
          delete approval.matrix[seq]
        })
        approval.sequence_ids = approval.sequence_ids.filter(sid => !sequences.find(s => s === sid));
        approval.revoked_sequence_ids = [...(approval.revoked_sequence_ids || []),...sequences]
      } else {
        // full revoke
        approval.status = ApprovalAllOfStatusEnum.cancelled;
      }

      return newValue;
    },
  };
  base.force = true;
  return base;
};

type ApprovalMatrixSlice = { approvalMatrix: ApprovalMatrix };
type ApprovalMatrix = { [K: string]: { [K: string]: ApprovalStatus } };

export const fetchApprovalMatrix = () => {
  const base = fullApprovalMatrix<ApprovalMatrixSlice>();

  base.url = getUrl(base.url);

  base.transform = (response: ApprovalMatrix) => ({ approvalMatrix: response });

  base.update = {
    approvalMatrix: (oldValue, newValue) => deepmerge(oldValue, newValue),
  };
  base.force = true;
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
  base.force = true;
  return base;
};
