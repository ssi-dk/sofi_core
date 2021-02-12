import { Column } from "sap-client";

export type StrictColumn<T> = Omit<Column, "field_name" | "approves_with"> & {
  field_name: keyof T;
  /**
   * When this field gets approved, it should also cause these fields to be sent with that approval
   */
  approves_with?: Array<keyof T>;
};
