import { combineReducers } from "@reduxjs/toolkit";
import { entitiesReducer, queriesReducer } from "redux-query";
import { connectRouter } from "connected-react-router";
import { selectionReducer } from "./analysis/analysis-selection-configs";

const createRootReducer = (history) => combineReducers({
  entities: entitiesReducer,
  queries: queriesReducer,
  selection: selectionReducer,
  router: connectRouter(history)
});

export type RootState = ReturnType<ReturnType<typeof createRootReducer>>;

export default createRootReducer;
