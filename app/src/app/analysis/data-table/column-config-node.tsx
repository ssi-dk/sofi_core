import React from "react";
import { Draggable } from "react-beautiful-dnd";

type ColumnConfigNodeProps = {
  columnName: string;
  index: number;
  isChecked: boolean;
  onChecked: (colAccessor: string) => void;
};

export const ColumnConfigNode: React.FC<ColumnConfigNodeProps> = ({
  columnName,
  isChecked,
  onChecked,
  index,
}) => {
  const onClick = React.useCallback(() => {
    onChecked(columnName);
  }, [onChecked, columnName]);

  const grid = 2;

  return (
    <Draggable key={columnName} draggableId={columnName} index={index}>
      {(provided, _) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            top: "auto !important",
            left: "auto !important",
            border: "1px solid gray",
            userSelect: "none",
            backgroundColor: "white",
            padding: grid * 2,
            margin: `0 0 ${grid}px 0`,
          }}
        >
          {":  "}
          <input type="checkbox" checked={isChecked} onChange={onClick} />{" "}
          {columnName}
        </div>
      )}
    </Draggable>
  );
};
