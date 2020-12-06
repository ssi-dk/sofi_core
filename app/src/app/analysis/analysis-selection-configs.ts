import { createAction, createReducer } from "@reduxjs/toolkit";
import { AnalysisResult } from "sap-client";
import { DataTableSelection } from "./data-table/data-table";

interface SelectionState {
  selection: DataTableSelection<AnalysisResult>;
}

export const setSelection = createAction<DataTableSelection<AnalysisResult>>(
  "analysis/setSelection"
);

export const incSelection = createAction<{
  id: string;
  fields: Array<keyof AnalysisResult>;
}>("analysis/incSelection");

export const clearSelection = createAction("analysis/clearSelection");

const initialState: SelectionState = {
  selection: {} as DataTableSelection<AnalysisResult>,
};

export const selectionReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(setSelection, (state, action) => {
      state.selection = Object.keys(action.payload)
        .filter((x) =>
          Object.values(action.payload[x]).reduce((a, b) => a || b)
        )
        .reduce(
          (o: DataTableSelection<AnalysisResult>, k) => ({
            ...o,
            [k]: action.payload[k],
          }),
          {} as DataTableSelection<AnalysisResult>
        );
    })
    .addCase(clearSelection, (state) => {
      state.selection = {} as DataTableSelection<AnalysisResult>;
    });
});
