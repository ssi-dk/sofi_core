import { Column } from "sap-client";

export type StrictColumn<T> = Omit<Column, "fieldName" | "approvesWith"> & {
  fieldName: keyof T;
  approvesWith: Array<keyof T>;
};
