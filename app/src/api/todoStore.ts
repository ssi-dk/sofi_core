import axios from "axios";
import { Todo } from "features/todoList/types";

const baseUrl = "https://jsonplaceholder.typicode.com/todos";

export async function readTodos(): Promise<Todo[]> {
  const response = await axios.get<Todo[]>(baseUrl, {
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  });

  return response.data;
}

export async function writeTodos(todos: Todo[]) {
  /*await axios.put<Todo[]>(baseUrl + window.location.pathname, todos, {
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  });*/
  console.log("wrote");
}
