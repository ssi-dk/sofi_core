import { createAction, createReducer } from "@reduxjs/toolkit";
import { AnalysisResult } from "sap-client";
import { DataTableSelection } from "./data-table/data-table";

interface SelectionState {
  selection: DataTableSelection<AnalysisResult>;
}

export const updateSelectionOriginal = createAction<Record<string, AnalysisResult>>(
  "analysis/updateSelectionOriginal"
);

export const setSelection = createAction<DataTableSelection<AnalysisResult>>(
  "analysis/setSelection"
);

export const clearSelection = createAction("analysis/clearSelection");

const initialState: SelectionState = {
  selection: {} as DataTableSelection<AnalysisResult>,
};

export const selectionReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(setSelection, (state, action) => {
      state.selection = Object.keys(action.payload)
        .filter((x) =>
          Object.values(action.payload[x].cells).reduce((a, b) => a || b, false)
        )
        .reduce(
          (o: DataTableSelection<AnalysisResult>, k) => ({
            ...o,
            [k]: action.payload[k],
          }),
          {} as DataTableSelection<AnalysisResult>
        );
    })
    .addCase(updateSelectionOriginal, (state, action) => {
      const payload = action.payload;
      const payloadKeys = Object.keys(payload);
      const selectionKeys = Object.keys(state.selection)

      const intersection = payloadKeys.filter(value => selectionKeys.includes(value));
      if (intersection.length === 0) {
        return;
      }

      state.selection = selectionKeys.reduce(
        (o, k) => {
          const value = state.selection[k];
          if (payload[k]) {
            value.original = payload[k];
          }
          return {
            ...o,
            [k]: value,
          };
        },
        {} as DataTableSelection<AnalysisResult>
      );
    })
    .addCase(clearSelection, (state) => {
      state.selection = {} as DataTableSelection<AnalysisResult>;
    });
});
