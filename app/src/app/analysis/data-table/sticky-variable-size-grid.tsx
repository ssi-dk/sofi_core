import React, { Ref } from "react";
import {
  VariableSizeGrid as Grid,
  VariableSizeGrid,
  VariableSizeGridProps,
} from "react-window";

function getCellIndicies(child) {
  return { row: child.props.rowIndex, column: child.props.columnIndex };
}

function getShownIndicies(children) {
  let minRow = Infinity;
  let maxRow = -Infinity;
  let minColumn = Infinity;
  let maxColumn = -Infinity;

  React.Children.forEach(children, (child) => {
    const { row, column } = getCellIndicies(child);
    minRow = Math.min(minRow, row);
    maxRow = Math.max(maxRow, row);
    minColumn = Math.min(minColumn, column);
    maxColumn = Math.max(maxColumn, column);
  });

  return {
    from: {
      row: minRow,
      column: minColumn,
    },
    to: {
      row: maxRow,
      column: maxColumn,
    },
  };
}

function useInnerElementType(Cell, columnWidth, rowHeight) {
  return React.useMemo(
    () =>
      React.forwardRef((props, ref) => {
        function sumRowsHeights(index) {
          let sum = 0;

          while (index > 1) {
            sum += rowHeight(index - 1);
            index -= 1;
          }

          return sum;
        }

        function sumColumnWidths(index) {
          let sum = 0;

          while (index > 1) {
            sum += columnWidth(index - 1);
            index -= 1;
          }

          return sum;
        }

        const shownIndicies = getShownIndicies(props.children);

        const children = React.Children.map(props.children, (child) => {
          const { column, row } = getCellIndicies(child);

          // do not show non-sticky cell
          if (column === 0 || row === 0) {
            return null;
          }
          return child;
        });

        children.push(
          React.createElement(Cell, {
            key: "0:0",
            rowIndex: 0,
            columnIndex: 0,
            style: {
              display: "inline-flex",
              width: columnWidth(0),
              height: rowHeight(0),
              position: "sticky",
              top: 0,
              left: 0,
              zIndex: 4,
            },
          })
        );

        const shownColumnsCount =
          shownIndicies.to.column - shownIndicies.from.column;

        for (let i = 1; i <= shownColumnsCount; i += 1) {
          const columnIndex = i + shownIndicies.from.column;
          const rowIndex = 0;
          const width = columnWidth(columnIndex);
          const height = rowHeight(rowIndex);

          const marginLeft = i === 1 ? sumColumnWidths(columnIndex) : undefined;

          children.push(
            React.createElement(Cell, {
              key: `${rowIndex}:${columnIndex}`,
              rowIndex,
              columnIndex,
              style: {
                marginLeft,
                display: "inline-flex",
                width,
                height,
                position: "sticky",
                top: 0,
                zIndex: 3,
              },
            })
          );
        }

        const shownRowsCount = shownIndicies.to.row - shownIndicies.from.row;

        for (let i = 1; i <= shownRowsCount; i += 1) {
          const columnIndex = 0;
          const rowIndex = i + shownIndicies.from.row;
          const width = columnWidth(columnIndex);
          const height = rowHeight(rowIndex);

          const marginTop = i === 1 ? sumRowsHeights(rowIndex) : undefined;

          children.push(
            React.createElement(Cell, {
              key: `${rowIndex}:${columnIndex}`,
              rowIndex,
              columnIndex,
              style: {
                marginTop,
                width,
                height,
                position: "sticky",
                left: 0,
                zIndex: 2,
              },
            })
          );
        }

        return (
          <div ref={ref as any} {...props}>
            {children}
          </div>
        );
      }),
    [Cell, columnWidth, rowHeight]
  );
}

type StickyVariableSizeGridProps = VariableSizeGridProps & { gridRef: React.Ref<VariableSizeGrid> }

export const StickyVariableSizeGrid: React.FC<StickyVariableSizeGridProps> = (
  props: StickyVariableSizeGridProps
) => {
  return (
    <Grid
      {...props}
      ref={props.gridRef}
      innerElementType={useInnerElementType(
        props.children,
        props.columnWidth,
        props.rowHeight
      )}
    />
  );
};
