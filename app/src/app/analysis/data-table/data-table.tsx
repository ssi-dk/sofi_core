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
  IdType,
} from "react-table";
import { FixedSizeGrid, FixedSizeList } from "react-window";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { jsx, SerializedStyles } from "@emotion/react";
import scrollbarWidth from "app/analysis/data-table/scrollbar-width-calculator";
import dtStyle, {
  getColumnStyle,
  headerButton,
  headerName,
} from "app/analysis/data-table/data-table.styles";
import { IndexableOf, NotEmpty } from "utils";
import SelectionCheckBox from "./selection-check-box";
import { ColumnConfigWidget } from "./column-config-widget";

export type DataTableSelection<T extends NotEmpty> = {
  [K in IndexableOf<T>]: { [k in IndexableOf<T>]: boolean };
};

type DataTableProps<T extends NotEmpty> = {
  columns: Column<T>[];
  data: T[];
  primaryKey: keyof T;
  canSelectColumn: (columnName: string) => boolean;
  canEditColumn: (columnName: string) => boolean;
  getDependentColumns: (columnName: keyof T) => Array<keyof T>;
  selectionStyle: SerializedStyles;
  onSelect: (sel: DataTableSelection<T>) => void;
};

function DataTable<T extends NotEmpty>(props: DataTableProps<T>) {
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
    canSelectColumn,
    getDependentColumns,
  } = props;
  const [selection, setSelection] = React.useState({} as DataTableSelection<T>);

  const isInSelection = React.useCallback(
    (cell: Cell<T, T>) => {
      const row = cell.row.original[primaryKey];
      const col = cell.column.id as IndexableOf<T>;
      console.log(primaryKey);
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
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    totalColumnsWidth,
    prepareRow,
    allColumns,
    setColumnOrder,
  } = useTable(
    {
      columns,
      data: data ?? [],
      defaultColumn,
    },
    useBlockLayout,
    useResizeColumns,
    useColumnOrder,
    useSortBy
  );

  const currentColOrder = React.useRef<Array<IdType<T>>>();

  const calcTableSelectionState = React.useCallback(() => {
    // TODO: Probably have to filter out 'unapprovable' columns when we know what those are
    const columnCount = columns.filter((x) => typeof x.accessor === "string")
      .length;
    const count = Object.values(selection).reduce(
      (acc: number, val) =>
        acc + Object.values(val).reduce((a, v) => (v ? a + 1 : a), 0),
      0
    );
    if (count === 0) return { checked: false, indeterminate: false };
    if (count === columnCount * rows.length)
      return { checked: true, indeterminate: false };
    return { indeterminate: true, checked: false };
  }, [selection, rows, columns]);

  const calcRowSelectionState = React.useCallback(
    (row: Row<T>) => {
      const r = selection[row.original[primaryKey]] || {};
      // TODO: Probably have to filter out 'unapprovable' columns when we know what those are
      const columnCount = columns.filter((x) => typeof x.accessor === "string")
        .length;
      const count = Object.values(r).reduce(
        (acc: number, val) => (val ? acc + 1 : acc),
        0
      );
      if (count === 0) return { checked: false, indeterminate: false };
      if (count === columnCount) return { checked: true, indeterminate: false };
      return { indeterminate: true, checked: false };
    },
    [selection, primaryKey, columns]
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
        .map((x) => ({ [x.accessor as string]: !checked }))
        .reduce((acc, val) => ({ ...acc, ...val }));
      const incSel = { ...selection, [id]: { ...cols } };
      setSelection(incSel);
      onSelect(incSel);
    },
    [onSelect, selection, primaryKey, columns, calcRowSelectionState]
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
    },
    [
      selection,
      primaryKey,
      rows,
      calcColSelectionState,
      onSelect,
      getDependentColumns,
    ]
  );

  const onSelectAllRows = React.useCallback(() => {
    const { checked } = calcTableSelectionState();
    const allCols = columns
      .filter((x) => typeof x.accessor === "string")
      .map((x) => ({ [x.accessor as string]: !checked }))
      .reduce((acc, val) => ({ ...acc, ...val }));
    const sel = rows
      .map((r) => ({ [r.original[primaryKey]]: allCols }))
      .reduce((acc, val) => ({ ...acc, ...val }));
    const incSel = { ...selection, ...sel };
    setSelection(incSel);
    onSelect(incSel);
  }, [selection, primaryKey, rows, columns, calcTableSelectionState, onSelect]);

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
          {row.cells.map((cell) => (
            // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
            <div
              role="cell"
              css={getSelectionStyle(cell)}
              onClick={
                canSelectColumn(cell.column.id)
                  ? () => onSelectCell(cell)
                  : noop
              }
              onKeyDown={
                canSelectColumn(cell.column.id)
                  ? () => onSelectCell(cell)
                  : noop
              }
              key={cell.getCellProps().key}
              {...cell.getCellProps()}
            >
              {cell.render("Cell")}
            </div>
          ))}
        </div>
      );
    },
    [
      prepareRow,
      rows,
      canSelectColumn,
      getSelectionStyle,
      onSelectCell,
      onSelectRow,
      calcRowSelectionState,
      noop,
    ]
  );

  // Render the UI for your table
  return (
    <div css={dtStyle}>
      <div role="table" {...getTableProps()} className="tableWrap">
        <ColumnConfigWidget>
          {allColumns.map((column) => (
            <div key={column.id} style={{ marginTop: "5px" }}>
              <input type="checkbox" {...column.getToggleHiddenProps()} />{" "}
              {column.id}
            </div>
          ))}
        </ColumnConfigWidget>
        <div role="rowgroup">
          {headerGroups.map((headerGroup) => (
            <DragDropContext
              onDragStart={() => {
                currentColOrder.current = allColumns.map((o) => o.id);
              }}
              onDragEnd={() => {}}
              onDragUpdate={(dragUpdateObj) => {
                const colOrder = [...currentColOrder.current];
                const sIndex = dragUpdateObj.source.index;
                const dIndex =
                  dragUpdateObj.destination && dragUpdateObj.destination.index;

                if (typeof sIndex === "number" && typeof dIndex === "number") {
                  colOrder.splice(sIndex, 1);
                  colOrder.splice(dIndex, 0, dragUpdateObj.draggableId);
                  setColumnOrder(colOrder);
                }
              }}
            >
              <Droppable
                droppableId="droppableColumnOrder"
                direction="horizontal"
              >
                {(droppableProvided) => (
                  <React.Fragment>
                    <div
                      role="row"
                      {...headerGroup.getHeaderGroupProps()}
                      ref={droppableProvided.innerRef}
                    >
                      <SelectionCheckBox
                        onClick={() => onSelectAllRows()}
                        {...calcTableSelectionState()}
                      />
                      {headerGroup.headers.map((column, index) => (
                        <Draggable
                          key={column.id}
                          draggableId={column.id}
                          index={index}
                          isDragDisabled={false}
                        >
                          {(provided, snapshot) => {
                            return (
                              <div
                                tabIndex={column.index}
                                role="columnheader"
                                ref={provided.innerRef}
                                key={column.id}
                                {...column.getHeaderProps(
                                  column.getSortByToggleProps()
                                )}
                                onClick={() => {}} // Do not sort on header-click -- handled by button
                                onKeyDown={() => {}}
                              >
                                <div
                                  role="tab"
                                  {...provided.dragHandleProps}
                                  {...provided.draggableProps}
                                  css={getColumnStyle(
                                    snapshot,
                                    provided.draggableProps.style
                                  )}
                                >
                                  {canSelectColumn(column.id) && (
                                    <SelectionCheckBox
                                      onClick={(e) => {
                                        onSelectCol(column);
                                        e.stopPropagation();
                                      }}
                                      css={headerButton}
                                      {...calcColSelectionState(column)}
                                    />
                                  )}
                                  <span css={headerName}>
                                    {column.render("Header")}
                                  </span>
                                  <button
                                    type="button"
                                    css={headerButton}
                                    onClick={() =>
                                      column.toggleSortBy(!column.isSortedDesc)
                                    }
                                    onKeyDown={() =>
                                      column.toggleSortBy(!column.isSortedDesc)
                                    }
                                  >
                                    {column.isSorted
                                      ? column.isSortedDesc
                                        ? " ⯯"
                                        : " ⯭"
                                      : " ⬍"}
                                  </button>
                                </div>
                                {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
                                <div
                                  role="separator"
                                  onKeyDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }}
                                  {...column.getResizerProps()}
                                />
                              </div>
                            );
                          }}
                        </Draggable>
                      ))}
                    </div>
                  </React.Fragment>
                )}
              </Droppable>
            </DragDropContext>
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

export default DataTable;
