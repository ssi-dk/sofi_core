/** @jsxRuntime classic */
/** @jsx jsx */
import React from "react";
import { Column, ColumnInstance } from "react-table";
import { jsx } from "@emotion/react";
import { Tooltip } from "@chakra-ui/react";
import {
  getColumnStyle,
  headerButton,
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

  return (
    <div
      tabIndex={column.index}
      role="columnheader"
      key={column?.id}
      {...column.getHeaderProps(column.getSortByToggleProps())}
      title={undefined} // hides the "Toggle SortBy" tooltip
      onClick={noop} // Do not sort on header-click -- handled by button
      onKeyDown={noop}
    >
      <div role="tab" css={getColumnStyle()}>
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
        <Tooltip label={`Internal name: ${column.id}`}>
          <span css={headerName}>{column.render("Header")}</span>
        </Tooltip>
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
}

export default React.memo(
  DataTableColumnHeader
) as typeof DataTableColumnHeader;
