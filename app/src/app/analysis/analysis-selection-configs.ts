import { createAction, createReducer } from "@reduxjs/toolkit";
import { Analysis } from "sap-client";
import { DataTableSelection } from "./data-table/data-table";

interface SelectionState {
  selection: DataTableSelection<Analysis>;
}

export const setSelection = createAction<DataTableSelection<Analysis>>(
  "analysis/setSelection"
);

export const incSelection = createAction<{
  id: string;
  fields: Array<keyof Analysis>;
}>("analysis/incSelection");

export const clearSelection = createAction("analysis/clearSelection");

const initialState: SelectionState = {
  selection: {} as DataTableSelection<Analysis>,
};

export const selectionReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(setSelection, (state, action) => {
      state.selection = Object.keys(action.payload)
        .filter((x) =>
          Object.values(action.payload[x]).reduce((a, b) => a || b)
        )
        .reduce(
          (o: DataTableSelection<Analysis>, k) => ({
            ...o,
            [k]: action.payload[k],
          }),
          {} as DataTableSelection<Analysis>
        );
    })
    .addCase(clearSelection, (state) => {
      state.selection = {} as DataTableSelection<Analysis>;
    });
});
