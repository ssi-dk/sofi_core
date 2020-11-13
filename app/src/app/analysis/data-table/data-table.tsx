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
} from "react-table";
import { FixedSizeList } from "react-window";
import scrollbarWidth from "app/analysis/data-table/scrollbar-width-calculator";
import dtStyle, { selectedCell } from "app/analysis/data-table/data-table.styles";
import { jsx } from "@emotion/core";
import SelectionCheckBox from "./selection-check-box";
import { IndexableOf, NotEmpty } from "utils";

type DataTableSelection<T extends NotEmpty> = {
  [K in IndexableOf<T>]: { [K in IndexableOf<T>]: boolean }
};

type DataTableProps<T extends NotEmpty> = {
  columns: Column<T>[];
  data: T[];
  primaryKey: keyof T;
  onSelect: (key: keyof T, fields: Array<keyof T>, item: T) => void;
  onSelectMultiple: (sel: DataTableSelection<T>) => void;
};

function DataTable<T extends NotEmpty>(props: DataTableProps<T>) {
  const defaultColumn = React.useMemo(
    () => ({
      width: 129,
    }),
    []
  );

  const scrollBarSize = React.useMemo(() => scrollbarWidth(), []);

  const { columns, data, primaryKey, onSelect, onSelectMultiple } = props;
  const [selection, setSelection] = React.useState({} as DataTableSelection<T>); 

  const isInSelection = React.useCallback((cell: Cell<T, any>) => {
    var row = cell.row.original[primaryKey];
    var col = cell.column.id as IndexableOf<T>;
    return selection[row] && selection[row][col];
  }, [selection, primaryKey]);

  const getSelectionStyle = React.useCallback((cell: Cell<T, any>) => {
    return isInSelection(cell) ? selectedCell : [];
  }, [isInSelection]);

  const onSelectCell = React.useCallback((cell: Cell<T, any>) => {
    if (cell.column.id === "selection") return; // cannot select the selection checkbox
    const row = cell.row.original[primaryKey];
    const col = cell.column.id as IndexableOf<T>;
    const incSel = { ...selection, [row]: { ...(selection[row] || {}), [col]: !isInSelection(cell) } };
    setSelection(incSel);
    onSelect(row, Object.keys((selection[row] || {})), cell.row.original);
  }, [onSelect, isInSelection, selection, primaryKey])



  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    totalColumnsWidth,
    prepareRow,
  } = useTable(
    {
      columns,
      data: data ?? [],
      defaultColumn,
    },
    useBlockLayout,
    useResizeColumns,
    useSortBy
  );
  
  const calcTableSelectionState = React.useCallback(() => {
    // TODO: Probably have to filter out 'unapprovable' columns when we know what those are
    const columnCount = columns.filter(x => typeof(x.accessor) === "string").length;
    const count = Object.values(selection)
                        .reduce((acc: number, val) => acc + Object.values(val).reduce((a, v) => v ? a + 1 : a, 0), 0);
    if (count === 0) return {checked: false, indeterminate: false};
    if (count === columnCount * rows.length) return {checked: true, indeterminate: false};
    return {indeterminate: true, checked: false};
  }, [selection, rows, columns]);

  const calcRowSelectionState = React.useCallback((row: Row<T>) => {
    const r = selection[row.original[primaryKey]] || {};
    // TODO: Probably have to filter out 'unapprovable' columns when we know what those are
    const columnCount = columns.filter(x => typeof(x.accessor) === "string").length;
    const count = Object.values(r).reduce((acc: number, val) => val ? acc + 1 : acc, 0);
    if (count === 0) return {checked: false, indeterminate: false};
    if (count === columnCount) return {checked: true, indeterminate: false};
    return {indeterminate: true, checked: false};
  }, [selection, primaryKey, columns]);

  const onSelectRow = React.useCallback((row: Row<T>) => {
    const {checked} = calcRowSelectionState(row);
    const id = row.original[primaryKey];
    const cols = columns.filter(x => typeof(x.accessor) === "string")
                        .map(x => ({[x.accessor as string]: !checked}))
                        .reduce((acc, val) => ({...acc, ...val}));
    const incSel = { ...selection, [id]: {...cols} };
    setSelection(incSel);
    onSelect(id, Object.keys(cols), row.original);
  }, [onSelect, selection, primaryKey, columns, calcRowSelectionState])

  const onSelectAllRows = React.useCallback(() => {
    const {checked} = calcTableSelectionState();
    const allCols = columns.filter(x => typeof(x.accessor) === "string")
                           .map(x => ({[x.accessor as string]: !checked}))
                           .reduce((acc, val) => ({...acc, ...val})); 
    const sel = rows.map(r => ({ [r.original[primaryKey]]: allCols}))
                    .reduce((acc, val) => ({...acc, ...val}));
    const incSel = { ...selection, ...sel };
    setSelection(incSel);
    onSelectMultiple(incSel);
  }, [onSelectMultiple, selection, primaryKey, rows, columns, calcTableSelectionState])

  const RenderRow = React.useCallback(
    ({ index, style }) => {
      const row = rows[index];
      prepareRow(row);
      return (
        <div role="row"
          {...row.getRowProps({
            style,
          })}
        >
          <SelectionCheckBox onClick={() => onSelectRow(row)} {...calcRowSelectionState(row)} />
          {row.cells.map((cell) => (
            <div role="cell"
                 css={getSelectionStyle(cell)}
                 onClick={() => onSelectCell(cell)}
                 key={cell.getCellProps().key} {...cell.getCellProps()}>
              {cell.render("Cell")}
            </div>
          ))}
        </div>
      );
    },
    [prepareRow, rows, getSelectionStyle, onSelectCell, onSelectRow, calcRowSelectionState]
  );

  // Render the UI for your table
  return (
    <div css={dtStyle}>
      <div role="table" {...getTableProps()} className="tableWrap">
        <div role="rowgroup">
          {headerGroups.map((headerGroup) => (
            <div role="row" {...headerGroup.getHeaderGroupProps()}>
              <SelectionCheckBox onClick={() => onSelectAllRows()} {...calcTableSelectionState()} />
              {headerGroup.headers.map((column) => (
                <div role="columnheader" {...column.getHeaderProps(column.getSortByToggleProps())} key={column.id}>
                  {column.render("Header")}
                  <span>
                    {column.isSorted
                      ? column.isSortedDesc
                        ? ' 🔽'
                        : ' 🔼'
                      : ''}
                  </span>
                  <div role="separator" {...column.getResizerProps()}/>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div role="rowgroup" {...getTableBodyProps()}>
          <FixedSizeList
            height={600}
            itemCount={rows.length}
            itemSize={50}
            width={totalColumnsWidth + scrollBarSize}
          >
            {RenderRow}
          </FixedSizeList>
        </div>
      </div>
    </div>
  );
}

DataTable.whyDidYouRender = true;

export default DataTable;
