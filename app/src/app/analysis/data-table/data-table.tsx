/** @jsxRuntime classic */
/** @jsx jsx */
import React from "react";
import {
  useTable,
  useBlockLayout,
  Column,
  useResizeColumns,
  Cell,
  Row,
  useSortBy,
  useColumnOrder,
  TableState,
  IdType,
} from "react-table";
import { VariableSizeGrid } from 'react-window';
import { jsx, SerializedStyles } from "@emotion/react";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import scrollbarWidth from "app/analysis/data-table/scrollbar-width-calculator";
import dtStyle from "app/analysis/data-table/data-table.styles";
import { IndexableOf, NotEmpty } from "utils";
import SelectionCheckBox from "./selection-check-box";
import DataTableHeader from "./data-table-header";
import { exportDataTable } from "./table-spy";
import { UserDefinedView } from "../../../sap-client/models";
import { StickyVariableSizeGrid } from "./sticky-variable-size-grid";
import DataTableColumnHeader from "./data-table-column-header";

export type DataTableSelection<T extends NotEmpty> = {
  [K in IndexableOf<T>]: { [k in IndexableOf<T>]: boolean };
};

type DataTableProps<T extends NotEmpty> = {
  columns: Column<T>[];
  data: T[];
  primaryKey: keyof T;
  canSelectColumn: (columnName: string) => boolean;
  canApproveColumn: (columnName: string) => boolean;
  canEditColumn: (columnName: string) => boolean;
  getDependentColumns: (columnName: keyof T) => Array<keyof T>;
  selectionStyle: SerializedStyles;
  approvableColumns: string[];
  onSelect: (sel: DataTableSelection<T>) => void;
  view: UserDefinedView;
};

function DataTable<T extends NotEmpty>(props: DataTableProps<T>) {

  const datagridRef = React.useRef<VariableSizeGrid>(null);

  const defaultColumn = React.useMemo(
    () => ({
      width: 140,
    }),
    []
  );
  const noop = React.useCallback(() => {}, []);

  const scrollBarSize = React.useMemo(() => scrollbarWidth(), []);

  const {
    columns,
    data,
    primaryKey,
    onSelect,
    selectionStyle,
    canEditColumn,
    approvableColumns,
    canSelectColumn,
    canApproveColumn,
    getDependentColumns,
    view,
  } = props;
  const [selection, setSelection] = React.useState({} as DataTableSelection<T>);

  const isInSelection = React.useCallback(
    (cell: Cell<T, T>) => {
      const row = cell.row.original[primaryKey];
      const col = cell.column.id as IndexableOf<T>;
      return selection[row] && selection[row][col];
    },
    [selection, primaryKey]
  );

  const getSelectionStyle = React.useCallback(
    (cell: Cell<T, T>) => {
      return isInSelection(cell) ? selectionStyle : [];
    },
    [isInSelection, selectionStyle]
  );

  const onSelectCell = React.useCallback(
    (cell: Cell<T, T>) => {
      if (cell.column.id === "selection") return; // cannot select the selection checkbox
      const row = cell.row.original[primaryKey];
      const col = cell.column.id as IndexableOf<T>;
      const incSel = {
        ...selection,
        [row]: { ...(selection[row] || {}), [col]: !isInSelection(cell) },
      };
      getDependentColumns(col).forEach((v) => {
        incSel[row][v as string] = !(selection[row] && selection[row][col]);
      });
      setSelection(incSel);
      onSelect(incSel);
    },
    [onSelect, isInSelection, selection, primaryKey, getDependentColumns]
  );

  const {
    state,
    getTableProps,
    getTableBodyProps,
    headerGroups,
    visibleColumns,
    rows,
    totalColumnsWidth,
    prepareRow,
    allColumns,
    setColumnOrder,
  } = useTable(
    {
      columns,
      data: data ?? [],
      useControlledState: React.useCallback(
        (s) => ({ ...s, ...(view as TableState<T>) }),
        [view]
      ),
      defaultColumn,
    },
    useBlockLayout,
    useResizeColumns,
    useColumnOrder,
    useSortBy
  );

  const { columnResizing, columnOrder, hiddenColumns, sortBy } = state;

  // Make data table configuration externally visible
  exportDataTable(state);

  const calcTableSelectionState = React.useCallback(() => {
    const columnCount = approvableColumns.length;
    const count = Object.values(selection).reduce(
      (acc: number, val) =>
        acc + Object.values(val).reduce((a, v) => (v ? a + 1 : a), 0),
      0
    );
    if (count === 0) return { checked: false, indeterminate: false };
    if (count === columnCount * rows.length)
      return { checked: true, indeterminate: false };
    return { indeterminate: true, checked: false };
  }, [selection, rows, approvableColumns]);

  const calcRowSelectionState = React.useCallback(
    (row: Row<T>) => {
      const r = selection[row.original[primaryKey]] || {};
      const count = Object.values(r).reduce(
        (acc: number, val) => (val ? acc + 1 : acc),
        0
      );
      if (count === 0) return { checked: false, indeterminate: false };
      if (count === approvableColumns.length)
        return { checked: true, indeterminate: false };
      return { indeterminate: true, checked: false };
    },
    [selection, primaryKey, approvableColumns]
  );

  const calcColSelectionState = React.useCallback(
    (col: Column<T>) => {
      const c = Object.values(selection).filter((x) => x[col.id] === true);
      if (c.length === 0) return { checked: false, indeterminate: false };
      if (c.length === rows.length)
        return { checked: true, indeterminate: false };
      return { indeterminate: true, checked: false, visible: true };
    },
    [selection, rows]
  );

  const onSelectRow = React.useCallback(
    (row: Row<T>) => {
      const { checked } = calcRowSelectionState(row);
      const id = row.original[primaryKey];
      const cols = columns
        .filter((x) => typeof x.accessor === "string")
        .filter((x) => canApproveColumn(x.accessor as string))
        .map((x) => ({ [x.accessor as string]: !checked }))
        .reduce((acc, val) => ({ ...acc, ...val }), []);
      const incSel = { ...selection, [id]: { ...cols } };
      setSelection(incSel);
      onSelect(incSel);
    },
    [
      onSelect,
      selection,
      primaryKey,
      columns,
      calcRowSelectionState,
      canApproveColumn,
    ]
  );

  const onColumnResize = React.useCallback((colIndex: number) => {
    if (datagridRef?.current?.resetAfterColumnIndex)
    {
      datagridRef.current.resetAfterColumnIndex(colIndex);
    }
  }, [datagridRef])

  const onSelectCol = React.useCallback(
    (col: Column<T>) => {
      onColumnResize(0);
      const { checked } = calcColSelectionState(col);
      const sel = rows
        .map((r) => ({
          [r.original[primaryKey]]: {
            ...selection[r.original[primaryKey]],
            [col.id as string]: !checked,
          },
        }))
        .reduce((acc, val) => ({ ...acc, ...val }));
      const incSel = { ...selection, ...sel };
      getDependentColumns(col.id).forEach((c) => {
        rows
          .map((r) => r.original[primaryKey])
          .forEach((r: string) => {
            incSel[r][c as string] = !(selection[r] && selection[r][c]);
          });
      });
      setSelection(incSel);
      onSelect(incSel);
    },
    [
      selection,
      primaryKey,
      rows,
      calcColSelectionState,
      onSelect,
      getDependentColumns,
      onColumnResize
    ]
  );

  const onSelectAllRows = React.useCallback(() => {
    const { checked } = calcTableSelectionState();
    const allCols = approvableColumns
      .map((x) => ({ [x]: !checked }))
      .reduce((acc, val) => ({ ...acc, ...val }));
    const sel = rows
      .map((r) => ({ [r.original[primaryKey]]: allCols }))
      .reduce((acc, val) => ({ ...acc, ...val }));
    const incSel = { ...selection, ...sel };
    setSelection(incSel);
    onSelect(incSel);
  }, [
    selection,
    primaryKey,
    rows,
    approvableColumns,
    calcTableSelectionState,
    onSelect,
  ]);

  const RenderCell = React.useCallback(
    (cell) => (
      // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
      <div
        role="cell"
        css={getSelectionStyle(cell)}
        onClick={
          canSelectColumn(cell.column.id) ? () => onSelectCell(cell) : noop
        }
        onKeyDown={
          canSelectColumn(cell.column.id) ? () => onSelectCell(cell) : noop
        }
        key={cell.getCellProps().key}
        {...cell.getCellProps()}
      >
        {cell.render("Cell")}
      </div>
    ),
    [getSelectionStyle, canSelectColumn, onSelectCell, noop]
  );

  
  const RenderCell2 = React.useCallback(
    ({ columnIndex, rowIndex, style }) => {
      // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
      if (rowIndex === 0) {
        // we are the header 'row'
        const col = visibleColumns[columnIndex];
        return (
          <div style={style}>
            <DataTableColumnHeader<T>
              column={col as any}
              columnIndex={columnIndex}
              calcColSelectionState={calcColSelectionState}
              canSelectColumn={canSelectColumn}
              onSelectCol={onSelectCol}
              onResize={onColumnResize}
            />
          </div>
        );
      }
      const rowId = rows[rowIndex - 1].id;
      const columnId = visibleColumns[columnIndex].id;
      return (
        <div
          role="cell"
          style={style}
          //      css={getSelectionStyle(cell)}
          //      onClick={
          //        canSelectColumn(cell.column.id) ? () => onSelectCell(cell) : noop
          //      }
          //      onKeyDown={
          //        canSelectColumn(cell.column.id) ? () => onSelectCell(cell) : noop
          //      }
          //      key={cell.getCellProps().key}
          //      {...cell.getCellProps()}
        >
          <div>
            {`${rows[rowIndex - 1].original[columnId]}`}
          </div>
        </div>
      );
    },
    [rows, visibleColumns, calcColSelectionState, canSelectColumn, onSelectCol, onColumnResize]
  );

  /*

  const RenderRow = React.useCallback(
    ({ index, style }) => {
      const row = rows[index];
      prepareRow(row);
      return (
        <div
          role="row"
          {...row.getRowProps({
            style,
          })}
        >
          <SelectionCheckBox
            onClick={(e) => {
              onSelectRow(row);
              e.preventDefault();
              e.stopPropagation();
            }}
            {...calcRowSelectionState(row)}
          />
          {row.cells.map(RenderCell)}
        </div>
      );
    },
    [
      prepareRow,
      rows,
      onSelectRow,
      calcRowSelectionState,
      RenderCell
    ]
  );
  */

  const columnIds = React.useMemo(() => allColumns.map((o) => o.id), [
    allColumns,
  ]);

  const currentColOrder = React.useRef<Array<IdType<T>>>();

  const onDragStart = React.useCallback(() => {
    currentColOrder.current = columnIds;
  }, [columnIds, currentColOrder]);

  const onDragEnd = React.useCallback(
    (dragUpdateObj: DropResult) => {
      if (!dragUpdateObj.destination) {
        return;
      }

      const order = [...currentColOrder.current];
      const sIndex = dragUpdateObj.source.index;
      const dIndex =
        dragUpdateObj.destination && dragUpdateObj.destination.index;

      if (typeof sIndex === "number" && typeof dIndex === "number") {
        order.splice(sIndex, 1);
        order.splice(dIndex, 0, dragUpdateObj.draggableId);
        datagridRef.current.resetAfterIndices({
          columnIndex: dIndex < sIndex ? dIndex : sIndex,
          rowIndex: 1,
          shouldForceUpdate: false,
        });
        setColumnOrder(order);
      }
    },
    [currentColOrder, setColumnOrder, datagridRef]
  );

  const itemData = React.useMemo(
    () => {
      return {
        headers: visibleColumns,
        rows: [...[{}], ...rows],
        prepareRow,
      };
    },
    [visibleColumns, rows, prepareRow]
  );

  const getColumnWidth = React.useCallback(
    (colIndex) => {
      const col = visibleColumns[colIndex];
      if (!columnResizing.columnWidths[col.id]) {
        return defaultColumn.width;
      }
      return columnResizing.columnWidths[col.id];
    },
    [columnResizing, defaultColumn.width, visibleColumns]
  );

  // Render the UI for your table
  return (
    <div css={dtStyle}>
      <div role="table" {...getTableProps()} className="tableWrap">
        <DragDropContext
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        >
          <div role="rowgroup" {...getTableBodyProps()}>
            <StickyVariableSizeGrid
              itemData={itemData}
              rowCount={itemData.rows.length}
              height={950}
              gridRef={datagridRef}
              rowHeight={() => 50}
              estimatedRowHeight={50}
              overscanColumnCount={0}
              columnWidth={getColumnWidth}
              estimatedColumnWidth={defaultColumn.width}
              width={1500}
              columnCount={visibleColumns.length}
            >
              {RenderCell2}
            </StickyVariableSizeGrid>
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}

export default React.memo(DataTable) as typeof DataTable;
