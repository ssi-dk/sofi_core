import { createAction, createReducer } from "@reduxjs/toolkit";
import { UserDefinedView } from 'sap-client';

const defaultView: UserDefinedView = {
    name: "Default",
    hiddenColumns: [],
    columnOrder: [],
    sortBy: []
}

export const defaultViews = [defaultView];

interface SelectedViewState {
  view: UserDefinedView;
}

export const setView = createAction<UserDefinedView>(
  "view/setView"
);

export const toggleColumnVisibility = createAction<string>(
  "view/toggleColumnVisibility"
)

export const setDefaultView = createAction("view/defaultView");

const initialState: SelectedViewState = {
    view: {
      hiddenColumns: []
    }
};

export const viewReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(toggleColumnVisibility, (state, action) => {
      const idx = state.view.hiddenColumns.indexOf(action.payload);
      if (idx > -1) {
        state.view.hiddenColumns = state.view.hiddenColumns.splice(idx + 1, 1)
      } else {
        state.view.hiddenColumns.push(action.payload)
      }
    })
    .addCase(setView, (state, action: any) => {
      state.view = {...action.payload}
    })
    .addCase(setDefaultView, (state) => {
      state.view = {...defaultView};
    });
});
