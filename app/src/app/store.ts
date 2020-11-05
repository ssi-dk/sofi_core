import { configureStore, Action, getDefaultMiddleware } from "@reduxjs/toolkit";
import { ThunkAction } from "redux-thunk";
import { queryMiddleware } from 'redux-query';
import superagentInterface from 'redux-query-interface-superagent';
import rootReducer, { RootState } from "./root-reducer";

// selectors
export const getQueries = (state: RootState) => state.queries;
export const getEntities = (state: RootState) => state.entities;

const store = configureStore({
  reducer: rootReducer,
  middleware: [
    ...getDefaultMiddleware({serializableCheck: false}),
    queryMiddleware(superagentInterface, getQueries, getEntities)]
});

if (process.env.NODE_ENV === "development" && module.hot) {
  module.hot.accept("./root-reducer", () => {
    const newRootReducer = require("./root-reducer").default;
    store.replaceReducer(newRootReducer);
  });
}

export type AppDispatch = typeof store.dispatch;
export type AppThunk = ThunkAction<void, RootState, null, Action<string>>;

export default store;
