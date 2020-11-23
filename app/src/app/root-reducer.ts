import { combineReducers } from "@reduxjs/toolkit";
import { entitiesReducer, queriesReducer } from "redux-query";
import { selectionReducer } from "./analysis/analysis-selection-configs";

const rootReducer = combineReducers({
  entities: entitiesReducer,
  queries: queriesReducer,
  selection: selectionReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
