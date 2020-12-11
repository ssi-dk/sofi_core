/** @jsxRuntime classic */
/** @jsx jsx */
import React from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { Column, ColumnInstance, HeaderGroup, IdType, SortingRule, TableState } from 'react-table';
import { jsx } from "@emotion/react";
import {
  getColumnStyle,
  headerButton,
  headerName,
} from "app/analysis/data-table/data-table.styles";
import { NotEmpty } from "utils";
import { UserDefinedViewColumnResizing } from 'sap-client';
import SelectionCheckBox from "./selection-check-box";

type DataTableHeaderProps<T extends NotEmpty> = {
  hiddenColumns: IdType<T>[];
  sortBy: SortingRule<T>[];
  columnResizing: UserDefinedViewColumnResizing;
  columnOrder: IdType<T>[];
  headerGroup: HeaderGroup<T>;
  allColumns: ColumnInstance<T>[],
  setColumnOrder: (updater: IdType<T>[] | ((columnOrder: IdType<T>[]) => IdType<T>[])) => void;
  calcColSelectionState: (column: Column<T>) => { checked: boolean, indeterminate: boolean, visible?: boolean };
  calcTableSelectionState: () => { checked: boolean, indeterminate: boolean, visible?: boolean };
  canSelectColumn: (column: string) => boolean;
  onSelectCol: (column: Column<T>) => void;
  onSelectAllRows: () => void;
}

function DataTableHeader<T extends NotEmpty>(props: DataTableHeaderProps<T>) {

  const {
    columnOrder,
    columnResizing,
    hiddenColumns,
    sortBy,
    allColumns,
    headerGroup,
    setColumnOrder,
    calcColSelectionState,
    canSelectColumn,
    onSelectCol,
    onSelectAllRows,
    calcTableSelectionState,
  } = props;

  const noop = React.useCallback(() => {}, []);

  const noPropagate = React.useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const columnIds = React.useMemo(() => allColumns.map((o) => o.id), [
    allColumns,
  ]);

  const currentColOrder = React.useRef<Array<IdType<T>>>();

  const onDragStart = React.useCallback(() => {currentColOrder.current = columnIds}, [columnIds, currentColOrder]);

  const onDragUpdate = React.useCallback((dragUpdateObj) => {
        const order = [...currentColOrder.current];
        const sIndex = dragUpdateObj.source.index;
        const dIndex =
          dragUpdateObj.destination && dragUpdateObj.destination.index;

        if (typeof sIndex === "number" && typeof dIndex === "number") {
          order.splice(sIndex, 1);
          order.splice(dIndex, 0, dragUpdateObj.draggableId);
          setColumnOrder(order);
        }
  }, [currentColOrder, setColumnOrder]);

  return (
    <DragDropContext
      onDragStart={onDragStart}
      onDragEnd={noop}
      onDragUpdate={onDragUpdate}
    >
      <Droppable droppableId="droppableColumnOrder" direction="horizontal">
        {(droppableProvided) => (
          <React.Fragment>
            <div
              role="row"
              {...headerGroup.getHeaderGroupProps()}
              ref={droppableProvided.innerRef}
            >
              <SelectionCheckBox
                onClick={onSelectAllRows}
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
                        onClick={noop} // Do not sort on header-click -- handled by button
                        onKeyDown={noop}
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
                          onKeyDown={noPropagate}
                          onClick={noPropagate}
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
  );
}

export default React.memo(DataTableHeader) as typeof DataTableHeader;
