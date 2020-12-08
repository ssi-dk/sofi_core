import { UserDefinedView } from "../../../../sap-client/models";

export const mapTableStateToView = (name: string, tableState): UserDefinedView => {
  return {
    name,
    sortBy: tableState.sortBy,
    hiddenColumns: tableState.hiddenColumns,
    columnResizing: {
      ...tableState.columnResizing,
      columnWidths: Object.keys(tableState.columnResizing.columnWidths).map(k => ({
        columnName: k,
        width: tableState.columnResizing.columnWidths[k]
      }))
    },
    columnOrder: tableState.columnOrder
  };
}