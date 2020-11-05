/** @jsx jsx */
import React from "react";
import {
  useTable,
  useBlockLayout,
  Column,
  useResizeColumns,
  useFlexLayout,
  useRowSelect,
} from "react-table";
import { FixedSizeList } from "react-window";
import scrollbarWidth from "app/analysis/data-table/scrollbar-width-calculator";
import dtStyle from "app/analysis/data-table/data-table.styles";
import { jsx } from "@emotion/core";

type DataTableProps<T extends object = {}> = {
  columns: Column<T>[];
  data: T[];
};

function DataTable<T extends object = {}>(props: DataTableProps<T>) {
  const defaultColumn = React.useMemo(
    () => ({
      width: 129,
    }),
    []
  );

  const scrollBarSize = React.useMemo(() => scrollbarWidth(), []);

  const { columns, data } = props;
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
    useBlockLayout
  );

  const RenderRow = React.useCallback(
    ({ index, style }) => {
      const row = rows[index];
      prepareRow(row);
      return (
        <tr
          {...row.getRowProps({
            style,
          })}
        >
          {row.cells.map((cell) => (
            <td key={cell.getCellProps().key} {...cell.getCellProps()}>
              {cell.render("Cell")}
            </td>
          ))}
        </tr>
      );
    },
    [prepareRow, rows]
  );

  // Render the UI for your table
  return (
    <div css={dtStyle}>
      <table {...getTableProps()} className="tableWrap">
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps()} key={column.id}>
                  {column.render("Header")}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody {...getTableBodyProps()}>
          <FixedSizeList
            height={600}
            itemCount={rows.length}
            itemSize={50}
            width={totalColumnsWidth + scrollBarSize}
          >
            {RenderRow}
          </FixedSizeList>
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
