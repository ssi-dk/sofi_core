import { combineReducers } from "@reduxjs/toolkit";
import { entitiesReducer, queriesReducer } from "redux-query";
import { selectionReducer } from "./analysis/analysis-selection-configs";
import { viewReducer } from './analysis/header/view-selector/analysis-view-selection-config';

const rootReducer = combineReducers({
  entities: entitiesReducer,
  queries: queriesReducer,
  selection: selectionReducer,
  view: viewReducer
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
