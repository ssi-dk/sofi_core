import { TableState } from "react-table";

const tableKey = "datatable";

export const exportDataTable = (state: TableState<any>) => {
  window.localStorage.setItem(tableKey, JSON.stringify(state));
};

export const spyDataTable = () => {
  return JSON.parse(window.localStorage.getItem(tableKey) || "{}");
};
