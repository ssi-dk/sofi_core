import { UserDefinedView } from "../../../../sap-client/models";

export const mapTableStateToView = (name: string, tableState): UserDefinedView => {
  return {
    name,
    sort_by: tableState.sortBy,
    hidden_columns: tableState.hiddenColumns,
    column_resizing: {
      ...tableState.columnResizing,
      column_widths: Object.keys(tableState.columnResizing.columnWidths).map(k => ({
        column_name: k,
        width: tableState.columnResizing.columnWidths[k]
      }))
    },
    column_order: tableState.columnOrder
  };
}