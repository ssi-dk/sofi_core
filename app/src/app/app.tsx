/** @jsx jsx */
import React from "react";
import TodoList from "features/todoList/TodoList";
import AddTodo from "features/todoList/AddTodo";
import Footer from "features/visiblityFilter/Footer";
import { useDispatch } from "react-redux";
import { loadTodos, createTodoList } from "features/todoList/todoSlice";
import AnalysisDataTable from "features/data-table/analysis-data-table";
import { Global } from "@emotion/core";
import { flex, reset } from "./app.styles";
import { jsx } from "@emotion/core";

export default function App() {
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (window.location.pathname === "/") {
      //dispatch(createTodoList());
    } else {
      //dispatch(loadTodos());
    }
    dispatch(loadTodos());
  }, [dispatch]);
  return (
    <div css={flex}>
      <Global
        styles={reset}
      />
      <h1>SAP</h1>
      <AnalysisDataTable />
    </div>
  );
}
