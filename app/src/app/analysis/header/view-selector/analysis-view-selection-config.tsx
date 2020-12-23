import { createAction, createReducer } from "@reduxjs/toolkit";
import { UserDefinedView } from "sap-client";

const defaultView: UserDefinedView = {
  name: "Default",
  hidden_columns: [],
  column_order: [],
  sort_by: [],
};

export const defaultViews = [defaultView];

interface SelectedViewState {
  view: UserDefinedView;
}

export const setView = createAction<UserDefinedView>("view/setView");

export const toggleColumnVisibility = createAction<string>(
  "view/toggleColumnVisibility"
);

export const setDefaultView = createAction("view/defaultView");

const initialState: SelectedViewState = {
  view: {
    hidden_columns: [],
  },
};

export const viewReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(toggleColumnVisibility, (state, action) => {
      const idx = state.view.hidden_columns.indexOf(action.payload);
      if (idx > -1) {
        state.view.hidden_columns = state.view.hidden_columns.filter(
          (x) => x !== action.payload
        );
      } else {
        state.view.hidden_columns.push(action.payload);
      }
    })
    .addCase(setView, (state, action: {type: string, payload: UserDefinedView}) => {
      state.view = { ...action.payload };
    })
    .addCase(setDefaultView, (state) => {
      state.view = { ...defaultView };
    });
});
