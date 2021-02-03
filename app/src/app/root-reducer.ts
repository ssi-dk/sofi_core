import { combineReducers } from "@reduxjs/toolkit";
import { entitiesReducer, queriesReducer } from "redux-query";
import { connectRouter } from "connected-react-router";
import { selectionReducer } from "./analysis/analysis-selection-configs";
import { viewReducer } from './analysis/view-selector/analysis-view-selection-config';

const createRootReducer = (history) => (state, action) => {
  // Do top-level manipulations here
  if (action.type === "RESET/Analysis") {
    state = { ...state, entities: { ...state.entities, analysis: {} } };
  }

  const appReducer = combineReducers({
    entities: entitiesReducer,
    queries: queriesReducer,
    selection: selectionReducer,
    view: viewReducer,
    router: connectRouter(history),
  });

  return appReducer(state, action);
};

export type RootState = ReturnType<ReturnType<typeof createRootReducer>>;

export default createRootReducer;
