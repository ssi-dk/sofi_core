/** @jsxImportSource @compiled/react */
import React from "react";
import { Column, ColumnInstance } from "react-table";
import "@compiled/react";
import { Tooltip } from "@chakra-ui/react";
import { columnStyle, headerButton, headerName } from "./data-table-styles";
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
  onSort: ({ column: string, ascending: boolean }) => void;
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
    onSort,
  } = props;

  const noop = React.useCallback(() => {}, []);

  const doResize = React.useCallback(() => {
    onResize(columnIndex);
    // un-register the global event handler, if it was set
    document.onmouseup = undefined;
  }, [columnIndex, onResize]);

  const registerGlobalMouseUpHandler = React.useCallback(() => {
    // a hack to make sure the mouse-up event for doing the resize gets tracked,
    // even if the user has moved the mouse outside of the resize-control before releasing
    document.onmouseup = doResize;
  }, [doResize]);

  const noPropagate = React.useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const toggleSortHandler = React.useCallback(() => {
    onSort({ column: column.id, ascending: !column.isSortedDesc });
  }, [column, onSort]);

  return (
    <div
      tabIndex={column.index}
      role="columnheader"
      key={column?.id}
      {...(column.getHeaderProps(column.getSortByToggleProps()) as any)}
      title={undefined} // hides the "Toggle SortBy" tooltip
      onClick={noop} // Do not sort on header-click -- handled by button
      onKeyDown={noop}
    >
      <div role="tab" css={columnStyle}>
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
        <Tooltip placement="top" label={`Internal name: ${column.id}`}>
          <div>
            <span css={headerName}>{column.render("Header")}</span>
          </div>
        </Tooltip>
        <button
          type="button"
          css={headerButton}
          onClick={toggleSortHandler}
          onKeyDown={toggleSortHandler}
        >
          {column.isSorted ? (column.isSortedDesc ? " ⯯" : " ⯭") : " ⬍"}
        </button>
      </div>
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        role="separator"
        onClick={noPropagate}
        onKeyDown={noPropagate}
        {...column.getResizerProps()}
        onMouseDownCapture={registerGlobalMouseUpHandler}
        onMouseUpCapture={doResize}
      />
    </div>
  );
}

export default React.memo(
  DataTableColumnHeader
) as typeof DataTableColumnHeader;
