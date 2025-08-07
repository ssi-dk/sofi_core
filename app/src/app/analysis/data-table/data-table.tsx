import React, { useEffect, useState } from "react";
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
import { NotEmpty } from "utils";
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

export type DataTableSelection<T extends object> = Record<
  string,
  {
    original: T;
    cells: Partial<Record<keyof T, boolean>>;
  }
>;

type DataTableProps<T extends NotEmpty> = {
  columns: Column<T>[];
  setNewColumnOrder: (columnOrder: string[]) => void;
  setColumnSort?: (columnSort: { column: string; ascending: boolean }) => void;
  data: T[];
  primaryKey: keyof T;
  canSelectColumn: (columnName: string) => boolean;
  canApproveColumn: (columnName: string) => boolean;
  isJudgedCell: (rowId: string, columnName: string) => boolean;
  getDependentColumns: (columnName: keyof T) => Array<keyof T>;
  selectionClassName?: string;
  approvableColumns: string[];
  onSelect?: (sel: DataTableSelection<T>) => void;
  selection: DataTableSelection<T>;
  onDetailsClick?: (isolateId: string, row: Row<T>) => void;
  view: UserDefinedViewInternal;
  getCellStyle: (
    rowId: string,
    columnId: string,
    value: any,
    cell: any
  ) => string;
  getStickyCellStyle: (rowId: string, rowData: any) => string;
  columnReordering?: ColumnReordering;
  columnSort?: { column: string; ascending: boolean };
  renderCellControl: (
    rowId: string,
    columnId: string,
    value: string,
    columnIndex: number,
    original: T
  ) => JSX.Element;
};

function DataTable<T extends NotEmpty>(props: DataTableProps<T>) {
  const dataGridRef = React.useRef<VariableSizeGrid>(null);

  const defaultColumn = React.useMemo(
    () => ({
      width: 140,
    }),
    []
  );

  const {
    columns,
    columnReordering,
    columnSort,
    setNewColumnOrder,
    setColumnSort,
    data,
    primaryKey,
    onSelect,
    onDetailsClick,
    selectionClassName,
    approvableColumns,
    canSelectColumn,
    canApproveColumn,
    isJudgedCell,
    getDependentColumns,
    getCellStyle,
    getStickyCellStyle,
    renderCellControl,
    view,
    selection,
  } = props;

  const isInSelection = React.useCallback(
    (rowId, columnId) => {
      return selection[rowId]?.cells?.[columnId];
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
        dataGridRef.current.resetAfterColumnIndex(0);
      }
      return merged as TableState<T>;
    },
    [view, lastView, setLastView, dataGridRef]
  );

  const onSelectCell = React.useCallback(
    (rowId, columnId) => {
      const incSel: DataTableSelection<T> = {
        ...selection,
        [rowId]: {
          original: data.find((d) => d[primaryKey] === rowId),
          cells: {
            ...(selection[rowId]?.cells || {}),
            [columnId]: !isInSelection(rowId, columnId),
          },
        },
      };
      getDependentColumns(columnId).forEach((v) => {
        incSel[rowId].cells[v] = !(
          selection[rowId]?.cells && selection[rowId]?.cells[columnId]
        );
      });
      onSelect(incSel);
    },
    [onSelect, isInSelection, getDependentColumns, data, primaryKey, selection]
  );

  const {
    state,
    getTableProps,
    getTableBodyProps,
    visibleColumns: visibleColumnInstances,
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

  // NOTE:
  // visibleColumns from useTable seems to be recalculated often, hence this
  // state and effect to handle memorization:
  const [visibleColumns, setVisibleColumns] = React.useState<Array<string>>([]);
  React.useEffect(() => {
    const hiddenColumnIds = view.hiddenColumns;
    const allColumnIds = columns.map((c) => String(c.accessor));
    const newVisibleColumns = allColumnIds.filter(
      (c) => hiddenColumnIds.indexOf(c) === -1
    );
    setVisibleColumns(newVisibleColumns);

    //Update approvable columns based on the current view
    const newSelection = Object.keys(selection).reduce(
      (acc, key) => {
          acc[key] = {
            original: selection[key].original,
            cells:  getAllApprovableCellsInSelection(key, newVisibleColumns),
          };
          return acc;
      },
      {} as DataTableSelection<T>
    );
    onSelect(newSelection);
  }, [view, columns]);

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
    dataGridRef.current.resetAfterIndices({
      columnIndex: destIdx < sourceIdx ? destIdx : sourceIdx,
      rowIndex: 1,
      shouldForceUpdate: false,
    });
    setColumnOrder(order);
    // Inform parent of the new order
    setNewColumnOrder(order);
  }

  useEffect(() => {
    if (!columnSort) {
      return;
    }

    const column = visibleColumnInstances.find(
      (x) => x.id == columnSort.column
    );

    column?.toggleSortBy(columnSort.ascending);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnSort]);

  // Make data table configuration externally visible
  exportDataTable(state);

  const visibleApprovableColumns = React.useMemo(
    () => visibleColumns.filter((x) => approvableColumns.indexOf(x) > -1),
    [visibleColumns, approvableColumns]
  );

  // Narrow selection to the currently visible columns
  React.useEffect(() => {
    if (selection) {
      const selectionClone = { ...selection };
      let needsNarrow = false;
      Object.keys(selection)
        .filter((x) => typeof x === "string")
        .map((r) => {
          Object.keys(selection[r].cells).map((k) => {
            if (
              visibleApprovableColumns.indexOf(k) < 0 &&
              selectionClone[r][k]
            ) {
              needsNarrow = true;
              selectionClone[r] = { ...selectionClone[r], [k]: false };
            }
          });
        });
      if (needsNarrow) {
        onSelect(selectionClone);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleApprovableColumns, onSelect, selection]);

  const calcRowSelectionState = React.useCallback(
    (row: Row<T>) => {
      const dataTableSelection = selection[row.original[primaryKey]];
      const checked = dataTableSelection !== undefined;
      const cells = dataTableSelection?.cells;
      const selectedCellCount = Object.values(cells ?? {}).reduce(
        (acc: number, val) => (val ? acc + 1 : acc),
        0
      );
      // If no cells marked, return of row is in selection
      if (selectedCellCount === 0) {
        return { checked, indeterminate: false };
      }
      // If all visible cells selected
      if (selectedCellCount === visibleApprovableColumns.length) {
        return { checked: true, indeterminate: false };
      }
      // Else, some cells selected
      return { indeterminate: true, checked: false };
    },
    [primaryKey, visibleApprovableColumns, selection]
  );

  const calcColSelectionState = React.useCallback(
    (col: Column<T>) => {
      const c = Object.values(selection).filter(
        (x) => x.cells[col.id] === true
      );
      if (c.length === 0) {
        return { checked: false, indeterminate: false };
      }
      if (c.length === rows.length) {
        return { checked: true, indeterminate: false };
      }
      return { indeterminate: true, checked: false, visible: true };
    },
    [rows, selection]
  );

  const onSelectRow = React.useCallback(
    (row: Row<T>) => {
      const { checked, indeterminate } = calcRowSelectionState(row);
      const id = row.original[primaryKey];

      let newSelection = {
        ...selection,
      };

      if (indeterminate || checked) {
        // Delete selection
        delete newSelection[id];
      } else {
        newSelection[id] = {
          original: row.original,
          cells: getAllApprovableCellsInSelection(id, visibleColumns),
        };
      }

      onSelect(newSelection);
    },
    [
      onSelect,
      primaryKey,
      columns,
      visibleColumns,
      isJudgedCell,
      calcRowSelectionState,
      canApproveColumn,
      selection,
    ]
  );

  const getAllApprovableCellsInSelection = React.useCallback(
    (id: string, newVisibleColumns: string[]) => {
      // Add all approvable cells to selection
      const cols = columns
        .filter((x) => typeof x.accessor === "string")
        .filter((x) => newVisibleColumns.indexOf(x.accessor as string) >= 0)
        .filter((x) => canApproveColumn(x.accessor as string))
        .filter((x) => !isJudgedCell(id, x.accessor as string))
        .map((x) => x.accessor as keyof T);

      return cols.reduce((a, b) => {
        a[b] = true;
        return a;
      }, {} as Record<keyof T, boolean>);
    }, 
    [columns, canApproveColumn, isJudgedCell]
  );

  const onColumnResize = React.useCallback(
    (colIndex: number) => {
      if (dataGridRef?.current?.resetAfterColumnIndex) {
        dataGridRef.current.resetAfterColumnIndex(colIndex);
      }
    },
    [dataGridRef]
  );

  const onSelectColumn = React.useCallback(
    (col: Column<T>) => {
      const { checked, indeterminate } = calcColSelectionState(col);
      const sel = rows
        .filter((r) => !isJudgedCell(r.original[primaryKey], col.id as string))
        .map((r) => ({
          [r.original[primaryKey]]: {
            original: r.original,
            cells: {
              ...selection[r.original[primaryKey]]?.cells,
              [col.id as string]: !checked && !indeterminate,
            },
          },
        }))
        .reduce((acc, val) => ({ ...acc, ...val }));
      const incSel: DataTableSelection<T> = { ...selection, ...sel };
      getDependentColumns(col.id).forEach((c) => {
        rows
          .map((r) => r.original[primaryKey])
          .forEach((r: string) => {
            if (incSel[r]) {
              incSel[r].cells[c] = !(selection[r] && selection[r].cells[c]);
            }
          });
      });
      onSelect(incSel);
      onColumnResize(0);
    },
    [
      primaryKey,
      rows,
      calcColSelectionState,
      onSelect,
      isJudgedCell,
      getDependentColumns,
      onColumnResize,
      selection,
    ]
  );

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
      if (event.ctrlKey && canApproveColumn(columnId)) {
        onSelectCell(rowId, columnId);
      }
    },
    [canApproveColumn, onSelectCell]
  );

  const RenderCell = React.useCallback(
    ({ columnIndex, rowIndex, style }) => {
      // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
      if (rowIndex === 0) {
        // we are the header 'row'
        const col = visibleColumnInstances[columnIndex];
        if (!col) {
          return <div />;
        }
        return (
          <div style={style}>
            <DataTableColumnHeader<T>
              column={col}
              columnIndex={columnIndex}
              calcColSelectionState={calcColSelectionState}
              canSelectColumn={canSelectColumn}
              onSelectColumn={onSelectColumn}
              onSort={setColumnSort}
              onResize={onColumnResize}
            />
          </div>
        );
      }
      const row = rows[rowIndex - 1];
      const rowId = row.original[primaryKey];
      const columnId = visibleColumnInstances[columnIndex].id;
      const cellStyle = getCellStyle(
        rowId,
        columnId,
        rows[rowIndex - 1].original[columnId],
        rows[rowIndex - 1].original
      );

      let className =
        columnIndex === 0
          ? `${getStickyCellStyle(rowId, row)} ${cellStyle}`
          : cellStyle;

      if (isInSelection(rowId, columnId)) {
        className = `${className} ${selectionClassName ?? ""}`;
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
          <Flex minWidth="full" minHeight="full">
            {columnIndex === 0 && (
              <React.Fragment>
                {onSelect ? (
                  <SelectionCheckBox
                    onClick={rowClickHandler(rows[rowIndex - 1])}
                    {...calcRowSelectionState(rows[rowIndex - 1])}
                  />
                ) : null}
                {onDetailsClick ? (
                  <IconButton
                    size="1em"
                    variant="unstyled"
                    onClick={() => onDetailsClick(rowId, row)}
                    aria-label="Search database"
                    icon={<ExternalLinkIcon marginTop="-0.5em" />}
                    ml="1"
                  />
                ) : null}
              </React.Fragment>
            )}
            {renderCellControl(
              rowId,
              columnId,
              rows[rowIndex - 1].original[columnId],
              columnIndex,
              rows[rowIndex - 1].original
            )}
          </Flex>
        </div>
      );
    },
    [
      rows,
      selectionClassName,
      setColumnSort,
      visibleColumnInstances,
      primaryKey,
      calcColSelectionState,
      calcRowSelectionState,
      canSelectColumn,
      onSelectColumn,
      onColumnResize,
      rowClickHandler,
      isInSelection,
      getCellStyle,
      getStickyCellStyle,
      onDetailsClick,
      renderCellControl,
      cellClickHandler,
      onSelect,
    ]
  );

  const itemData = React.useMemo(() => {
    return {
      headers: visibleColumnInstances,
      rows: [...[{}], ...rows],
      prepareRow,
    };
  }, [visibleColumnInstances, rows, prepareRow]);

  const getColumnWidth = React.useCallback(
    (colIndex) => {
      const col = visibleColumnInstances[colIndex];
      if (!col) return defaultColumn.width;
      if (!columnResizing.columnWidths[col.id]) {
        return defaultColumn.width;
      }
      return columnResizing.columnWidths[col.id];
    },
    [columnResizing, defaultColumn.width, visibleColumnInstances]
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
                gridRef={dataGridRef}
                rowHeight={() => 35}
                estimatedRowHeight={35}
                columnWidth={getColumnWidth}
                estimatedColumnWidth={defaultColumn.width}
                overscanRowCount={5}
                overscanColumnCount={2}
                width={width}
                columnCount={visibleColumnInstances.length}
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
