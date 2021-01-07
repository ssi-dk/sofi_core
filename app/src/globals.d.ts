import { ApprovalStatus as ApprStatus } from "sap-client/models/ApprovalStatus";

// work around codegen bug
declare global {
  type ApprovalStatus = ApprStatus;
}
