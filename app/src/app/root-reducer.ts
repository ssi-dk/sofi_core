import { combineReducers } from "@reduxjs/toolkit";
import { entitiesReducer, queriesReducer } from "redux-query";

const rootReducer = combineReducers({
  entities: entitiesReducer,
  queries: queriesReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
