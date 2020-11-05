import { combineReducers } from "@reduxjs/toolkit";
import { entitiesReducer, queriesReducer } from 'redux-query';

import todos from "features/todoList/todoSlice";
import visibilityFilter from "features/visiblityFilter/visibilityFilterSlice";

const rootReducer = combineReducers({
  todos,
  visibilityFilter,
  entities: entitiesReducer,
  queries: queriesReducer
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
