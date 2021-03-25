import { QueryExpression } from "sap-client";

// lucene type definitions
declare module "lucene" {
  declare function parse(input: string): QueryExpression;
}
