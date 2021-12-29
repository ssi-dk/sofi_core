import React, { useState } from "react";
import {
  useTable,
  useBlockLayout,
  Column,
  useResizeColumns,
  Row,
  useSortBy,
  useColumnOrder,
  TableState,
  IdType,
} from "react-table";
import { VariableSizeGrid } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { Flex, IconButton } from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import deepmerge from "lodash.merge";
import { UserDefinedViewInternal } from "models";
import { IndexableOf, NotEmpty } from "utils";
import SelectionCheckBox from "./selection-check-box";
import { exportDataTable } from "./table-spy";
import { StickyVariableSizeGrid } from "./sticky-variable-size-grid";
import DataTableColumnHeader from "./data-table-column-header";
import "./data-table.css";
import "./data-table-cell-styles.css";

export type ColumnReordering =
  | {
      sourceIdx: number;
      destIdx: number;
      targetId: string;
      timestamp: number;
    }
  | undefined;

export type DataTableSelection<T extends NotEmpty> = {
  [K in IndexableOf<T>]: { [k in IndexableOf<T>]: boolean };
};

type DataTableProps<T extends NotEmpty> = {
  columns: Column<T>[];
  setNewColumnOrder: (columnOrder: string[]) => void;
  data: T[];
  primaryKey: keyof T;
  canSelectColumn: (columnName: string) => boolean;
  canApproveColumn: (columnName: string) => boolean;
  canEditColumn: (columnName: string) => boolean;
  getDependentColumns: (columnName: keyof T) => Array<keyof T>;
  selectionClassName: string;
  approvableColumns: string[];
  onSelect: (sel: DataTableSelection<T>) => void;
  onDetailsClick: (isolateId: string, row: Row<T>) => void;
  view: UserDefinedViewInternal;
  getCellStyle: (rowId: string, columnId: string, value: any) => string;
  getStickyCellStyle: (rowId: string) => string;
  columnReordering?: ColumnReordering;
  renderCellControl: (
    rowId: string,
    columnId: string,
    value: string
  ) => JSX.Element;
};

function DataTable<T extends NotEmpty>(props: DataTableProps<T>) {
  const datagridRef = React.useRef<VariableSizeGrid>(null);

  const defaultColumn = React.useMemo(
    () => ({
      width: 140,
    }),
    []
  );

  const {
    columns,
    columnReordering,
    setNewColumnOrder,
    data,
    primaryKey,
    onSelect,
    onDetailsClick,
    selectionClassName,
    canEditColumn,
    approvableColumns,
    canSelectColumn,
    canApproveColumn,
    getDependentColumns,
    getCellStyle,
    getStickyCellStyle,
    renderCellControl,
    view,
  } = props;
  const [selection, setSelection] = React.useState({} as DataTableSelection<T>);

  const isInSelection = React.useCallback(
    (rowId, columnId) => {
      return selection[rowId] && selection[rowId][columnId];
    },
    [selection]
  );

  const [lastView, setLastView] = useState(view);

  const resolveViewState = React.useCallback(
    (s: TableState<T>) => {
      // use view as base, then play any nonEmptyState on top of it
      let merged: TableState<T> = {} as TableState<T>;
      deepmerge(merged, view, s) as TableState<T>;
      // if the view changed, it overwrites whatever state we have
      if (view !== lastView) {
        merged = (view as unknown) as TableState<T>;
        setLastView(view);
        // force columns to resize
        datagridRef.current.resetAfterColumnIndex(0);
      }
      return merged as TableState<T>;
    },
    [view, lastView, setLastView, datagridRef]
  );

  const onSelectCell = React.useCallback(
    (rowId, columnId) => {
      const incSel = {
        ...selection,
        [rowId]: {
          ...(selection[rowId] || {}),
          [columnId]: !isInSelection(rowId, columnId),
        },
      };
      getDependentColumns(columnId).forEach((v) => {
        incSel[rowId][v as string] = !(
          selection[rowId] && selection[rowId][columnId]
        );
      });
      setSelection(incSel);
      onSelect(incSel);
    },
    [onSelect, isInSelection, selection, getDependentColumns]
  );

  const {
    state,
    getTableProps,
    getTableBodyProps,
    visibleColumns,
    rows,
    prepareRow,
    allColumns,
    setColumnOrder,
  } = useTable(
    {
      columns,
      data: data ?? [],
      useControlledState: resolveViewState,
      defaultColumn,
    },
    useBlockLayout,
    useResizeColumns,
    useColumnOrder,
    useSortBy
  );

  const { columnResizing } = state;

  // Allow parent to control when we reorder our columns
  const currentColOrder = React.useRef<Array<IdType<T>>>();
  const lastColumnReorder = React.useRef<ColumnReordering>();
  const columnIds = React.useMemo(() => allColumns.map((o) => o.id), [
    allColumns,
  ]);

  if (
    columnReordering?.timestamp &&
    columnReordering.timestamp > (lastColumnReorder?.current?.timestamp || 1)
  ) {
    currentColOrder.current = columnIds;
    lastColumnReorder.current = { ...columnReordering };
    const order = [...currentColOrder.current];
    const { sourceIdx, destIdx, targetId } = columnReordering;
    order.splice(sourceIdx, 1);
    order.splice(destIdx, 0, targetId);
    datagridRef.current.resetAfterIndices({
      columnIndex: destIdx < sourceIdx ? destIdx : sourceIdx,
      rowIndex: 1,
      shouldForceUpdate: false,
    });
    setColumnOrder(order);
    // Inform parent of the new order
    setNewColumnOrder(order);
  }

  // Make data table configuration externally visible
  exportDataTable(state);

  const visibleApprovableColumns = React.useMemo(
    () =>
      visibleColumns.filter(
        (x) => approvableColumns.indexOf(x.id as string) > -1
      ),
    [visibleColumns, approvableColumns]
  );

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
      if (count === visibleApprovableColumns.length)
        return { checked: true, indeterminate: false };
      return { indeterminate: true, checked: false };
    },
    [selection, primaryKey, visibleApprovableColumns]
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
      const visibleCols = visibleColumns.map((x) => x.id);
      const id = row.original[primaryKey];
      const cols = columns
        .filter((x) => typeof x.accessor === "string")
        .filter((x) => visibleCols.indexOf(x.accessor as string) >= 0)
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
      visibleColumns,
      calcRowSelectionState,
      canApproveColumn,
    ]
  );

  const onColumnResize = React.useCallback(
    (colIndex: number) => {
      if (datagridRef?.current?.resetAfterColumnIndex) {
        datagridRef.current.resetAfterColumnIndex(colIndex);
      }
    },
    [datagridRef]
  );

  const onSelectCol = React.useCallback(
    (col: Column<T>) => {
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
      onColumnResize(0);
    },
    [
      selection,
      primaryKey,
      rows,
      calcColSelectionState,
      onSelect,
      getDependentColumns,
      onColumnResize,
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

  const rowClickHandler = React.useCallback(
    (row) => (e) => {
      onSelectRow(row);
      e.preventDefault();
      e.stopPropagation();
    },
    [onSelectRow]
  );

  const cellClickHandler = React.useCallback(
    (rowId, columnId) => (
      event: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
      event.stopPropagation();
      if (event.ctrlKey) {
        if (canSelectColumn) {
          onSelectCell(rowId, columnId);
        }
      }
    },
    [canSelectColumn, onSelectCell]
  );

  const RenderCell = React.useCallback(
    ({ columnIndex, rowIndex, style }) => {
      // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
      if (rowIndex === 0) {
        // we are the header 'row'
        const col = visibleColumns[columnIndex];
        if (!col) return <div />;
        return (
          <div style={style}>
            <DataTableColumnHeader<T>
              column={col}
              columnIndex={columnIndex}
              calcColSelectionState={calcColSelectionState}
              canSelectColumn={canSelectColumn}
              onSelectCol={onSelectCol}
              onResize={onColumnResize}
            />
          </div>
        );
      }
      const row = rows[rowIndex - 1];
      const rowId = row.original[primaryKey];
      const columnId = visibleColumns[columnIndex].id;
      let className =
        columnIndex === 0
          ? getStickyCellStyle(rowId)
          : getCellStyle(
              rowId,
              columnId,
              rows[rowIndex - 1].original[columnId]
            );

      if (isInSelection(rowId, columnId)) {
        className = `${className} ${selectionClassName}`;
      }

      return (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events
        <div
          role="cell"
          style={style}
          className={className}
          onClick={cellClickHandler(rowId, columnId)}
          key={columnIndex}
        >
          <Flex>
            {columnIndex === 0 && (
              <React.Fragment>
                <SelectionCheckBox
                  onClick={rowClickHandler(rows[rowIndex - 1])}
                  {...calcRowSelectionState(rows[rowIndex - 1])}
                />
                <IconButton
                  size="1em"
                  variant="unstyled"
                  onClick={() => onDetailsClick(rowId, row)}
                  aria-label="Search database"
                  icon={<ExternalLinkIcon marginTop="-0.5em" />}
                  ml="1"
                />
              </React.Fragment>
            )}
            {renderCellControl(
              rowId,
              columnId,
              rows[rowIndex - 1].original[columnId]
            )}
          </Flex>
        </div>
      );
    },
    [
      rows,
      selectionClassName,
      visibleColumns,
      primaryKey,
      calcColSelectionState,
      calcRowSelectionState,
      canSelectColumn,
      onSelectCol,
      onColumnResize,
      rowClickHandler,
      isInSelection,
      getCellStyle,
      getStickyCellStyle,
      onDetailsClick,
      renderCellControl,
      cellClickHandler,
    ]
  );

  const itemData = React.useMemo(() => {
    return {
      headers: visibleColumns,
      rows: [...[{}], ...rows],
      prepareRow,
    };
  }, [visibleColumns, rows, prepareRow]);

  const getColumnWidth = React.useCallback(
    (colIndex) => {
      const col = visibleColumns[colIndex];
      if (!col) return defaultColumn.width;
      if (!columnResizing.columnWidths[col.id]) {
        return defaultColumn.width;
      }
      return columnResizing.columnWidths[col.id];
    },
    [columnResizing, defaultColumn.width, visibleColumns]
  );

  // Render the UI for your table
  return (
    <AutoSizer>
      {({ height, width }) => (
        <div className="sofi-data-table">
          <div role="table" {...(getTableProps() as any)} className="tableWrap">
            <div role="rowgroup" {...(getTableBodyProps() as any)}>
              <StickyVariableSizeGrid
                itemData={itemData}
                rowCount={itemData.rows.length}
                height={height}
                gridRef={datagridRef}
                rowHeight={() => 35}
                estimatedRowHeight={35}
                columnWidth={getColumnWidth}
                estimatedColumnWidth={defaultColumn.width}
                overscanRowCount={5}
                overscanColumnCount={2}
                width={width}
                columnCount={visibleColumns.length}
              >
                {RenderCell}
              </StickyVariableSizeGrid>
            </div>
          </div>
        </div>
      )}
    </AutoSizer>
  );
}

export default React.memo(DataTable) as typeof DataTable;
