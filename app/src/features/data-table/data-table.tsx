/** @jsx jsx */
import React from 'react';
import { useTable, useBlockLayout, Column } from 'react-table';
import { FixedSizeList } from 'react-window';
import scrollbarWidth from 'features/data-table/scrollbar-width-calculator';
import style from 'features/data-table/data-table.styles';
import { jsx } from '@emotion/core';

type DataTableProps<T extends object = {}> = {
    columns: Column<T>[],
    data: T[]
}

function DataTable<T extends object = {}>(props: DataTableProps<T>) {

    const defaultColumn = React.useMemo(
        () => ({
            width: 150,
        }),
        []
    )

    const scrollBarSize = React.useMemo(() => scrollbarWidth(), [])

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        totalColumnsWidth,
        prepareRow,
    } = useTable(
        {
            columns: props.columns,
            data: props.data ?? [],
            defaultColumn: defaultColumn
        },
        useBlockLayout
    )

    const RenderRow = React.useCallback(
        ({ index, style }) => {
            const row = rows[index]
            prepareRow(row)
            return (
                <div
                    {...row.getRowProps({
                        style,
                    })}
                    className="tr"
                >
                    {row.cells.map(cell => {
                        return (
                            <div {...cell.getCellProps()} className="td">
                                {cell.render('Cell')}
                            </div>
                        )
                    })}
                </div>
            )
        },
        [prepareRow, rows]
    )

    // Render the UI for your table
    return (
        <div css={style}>
            <div {...getTableProps()} className="table">
                <div>
                    {headerGroups.map(headerGroup => (
                        <div {...headerGroup.getHeaderGroupProps()} className="tr">
                            {headerGroup.headers.map(column => (
                                <div {...column.getHeaderProps()} className="th">
                                    {column.render('Header')}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                <div {...getTableBodyProps()}>
                    <FixedSizeList
                        height={400}
                        itemCount={rows.length}
                        itemSize={35}
                        width={totalColumnsWidth + scrollBarSize}
                    >
                        {RenderRow}
                    </FixedSizeList>
                </div>
            </div>
        </div>
    )
}


export default DataTable;
