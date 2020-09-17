import React from "react";

interface TodoProps {
  completed: boolean;
  title: string;
  onClick: () => any;
}

export default function TodoListItem({ completed, title, onClick }: TodoProps) {
  return (
    <li
      onClick={onClick}
      style={{
        textDecoration: completed ? "line-through" : "none",
      }}
    >
      {title}
    </li>
  );
}
