import { createAction, createReducer } from "@reduxjs/toolkit";
import { UserDefinedViewInternal } from "models";

const defaultView: UserDefinedViewInternal = {
  name: "Default",
  columnResizing: { columnWidths: {} },
  hiddenColumns: [],
  columnOrder: [],
  sortBy: [],
};

export const defaultViews = [defaultView];

interface SelectedViewState {
  view: UserDefinedViewInternal;
}

export const setView = createAction<UserDefinedViewInternal>("view/setView");

export const toggleColumnVisibility = createAction<string>(
  "view/toggleColumnVisibility"
);

export const setDefaultView = createAction("view/defaultView");

const initialState: SelectedViewState = {
  view: JSON.parse(localStorage.getItem("view")) || defaultView,
};

export const viewReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(toggleColumnVisibility, (state, action) => {
      const idx = state.view.hiddenColumns.indexOf(action.payload);
      if (idx > -1) {
        state.view.hiddenColumns = state.view.hiddenColumns.filter(
          (x) => x !== action.payload
        );
      } else {
        state.view.hiddenColumns.push(action.payload);
      }
      localStorage.setItem("view",JSON.stringify(state.view))
    })
    .addCase(
      setView,
      (state, action: { type: string; payload: UserDefinedViewInternal }) => {
        state.view = { ...action.payload };
        localStorage.setItem("view",JSON.stringify(state.view))
      }
    )
    .addCase(setDefaultView, (state) => {
      state.view = { ...defaultView };
      localStorage.setItem("view",JSON.stringify(state.view))
    });
});
