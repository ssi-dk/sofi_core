/** @jsxRuntime classic */
/** @jsx jsx */
import React from "react";
import { Draggable, Droppable, DroppableProvided } from "react-beautiful-dnd";
import { Column, ColumnInstance } from "react-table";
import { jsx } from "@emotion/react";
import {
  getColumnStyle,
  headerButton,
  headerDragClone,
  headerName,
} from "app/analysis/data-table/data-table.styles";
import { NotEmpty } from "utils";
import SelectionCheckBox from "./selection-check-box";

type DataTableColumnHeaderProps<T extends NotEmpty> = {
  column: ColumnInstance<T>;
  columnIndex: number;
  calcColSelectionState: (
    column: Column<T>
  ) => { checked: boolean; indeterminate: boolean; visible?: boolean };
  canSelectColumn: (column: string) => boolean;
  onSelectCol: (column: Column<T>) => void;
  onResize: (columnIndex: number) => void;
};

function DataTableColumnHeader<T extends NotEmpty>(
  props: DataTableColumnHeaderProps<T>
) {
  const {
    column,
    columnIndex,
    calcColSelectionState,
    canSelectColumn,
    onSelectCol,
    onResize,
  } = props;

  const noop = React.useCallback(() => {}, []);

  const doResize = React.useCallback(() => onResize(columnIndex), [
    columnIndex,
    onResize,
  ]);

  const noPropagate = React.useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const ColumnHeader = React.useCallback(
    ({ provided, snapshot, innerRef }) => {
      return (
        <div
          tabIndex={column.index}
          role="columnheader"
          ref={innerRef}
          key={column?.id}
          {...column.getHeaderProps(column.getSortByToggleProps())}
          onClick={noop} // Do not sort on header-click -- handled by button
          onKeyDown={noop}
        >
          <div
            role="tab"
            {...provided.dragHandleProps}
            {...provided.draggableProps}
            css={getColumnStyle(snapshot, provided?.draggableProps?.style)}
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
            <span css={headerName}>{column.render("Header")}</span>
            <button
              type="button"
              css={headerButton}
              onClick={() => column.toggleSortBy(!column.isSortedDesc)}
              onKeyDown={() => column.toggleSortBy(!column.isSortedDesc)}
            >
              {column.isSorted ? (column.isSortedDesc ? " ⯯" : " ⯭") : " ⬍"}
            </button>
          </div>
          {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
          <div
            role="separator"
            onKeyDown={noPropagate}
            onClick={noPropagate}
            onMouseUp={doResize}
            {...column.getResizerProps()}
          />
        </div>
      );
    },
    [
      calcColSelectionState,
      column,
      doResize,
      noPropagate,
      noop,
      onSelectCol,
      canSelectColumn,
    ]
  );

  function HeaderClone({ provided, style }) {
    return (
      <div
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        ref={provided.innerRef}
        style={{ ...provided.draggableProps.style, ...style }}
      >
        <div css={headerDragClone}>{column.id}</div>
      </div>
    );
  }

  return (
    <Droppable
      droppableId={column.id}
      direction="horizontal"
      mode="virtual"
      renderClone={(provided, style) => (
        <HeaderClone provided={provided} style={style} />
      )}
    >
      {(providedDroppable: DroppableProvided) => (
        <div
          ref={providedDroppable.innerRef}
          {...providedDroppable.droppableProps}
        >
          <Draggable
            key={column.id}
            draggableId={column.id}
            index={columnIndex}
            isDragDisabled={false}
          >
            {(provided, snapshot) => (
              <ColumnHeader
                provided={provided}
                snapshot={snapshot}
                innerRef={provided.innerRef}
              />
            )}
          </Draggable>
        </div>
      )}
    </Droppable>
  );
}

export default React.memo(
  DataTableColumnHeader
) as typeof DataTableColumnHeader;
