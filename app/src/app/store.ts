import { configureStore, Action, getDefaultMiddleware } from "@reduxjs/toolkit";
import { ThunkAction } from "redux-thunk";
import { queryMiddleware } from "redux-query";
import { routerMiddleware } from "connected-react-router";
import superagentInterface from "redux-query-interface-superagent";
import { createBrowserHistory } from "history";
import createRootReducer, { RootState } from "./root-reducer";
import { jwtMiddleware } from "middleware/jwt-middleware";

// selectors
export const getQueries = (state: RootState) => state.queries;
export const getEntities = (state: RootState) => state.entities;

export const history = createBrowserHistory();

const store = configureStore({
  reducer: createRootReducer(history),
  middleware: [
    ...getDefaultMiddleware({ serializableCheck: false }),
    jwtMiddleware,
    queryMiddleware(superagentInterface, getQueries, getEntities),
    routerMiddleware(history),
  ],
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
