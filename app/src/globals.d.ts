import { ApprovalStatus as ApprStatus } from "sap-client/models/ApprovalStatus";
import { QueryExpression } from "sap-client";

// work around codegen bug
declare global {
  type ApprovalStatus = ApprStatus;
}

// lucene type definitions
declare module "lucene" {
  declare function parse(input: string): QueryExpression;
}
