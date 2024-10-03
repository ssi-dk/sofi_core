import { createAction, createReducer, createAsyncThunk } from "@reduxjs/toolkit";
import { AnalysisResult } from "sap-client";
import { DataTableSelection } from "./data-table/data-table";
import { AnalysisQuery } from "sap-client"

interface SelectionState {
  selection: DataTableSelection<AnalysisResult>;
}

type Search = {
  searchFunc: (query: AnalysisQuery, pageSize: number) => void;
  query: AnalysisQuery;
}

export const updateSelectionOriginal = createAction<
  Record<string, AnalysisResult>
>("analysis/updateSelectionOriginal");

export const setSelection = createAction<DataTableSelection<AnalysisResult>>(
  "analysis/setSelection"
);

export const clearSelection = createAction("analysis/clearSelection");

export const selectAllThunk = createAsyncThunk('analysis/selectAllThunk', async (search: Search, thunkAPI) => {
  search.searchFunc(search.query, 1000);
  
  let results = (thunkAPI.getState() as any).entities.analysis;
  while (!results || Object.keys(results).length === 0 || results.length === 0) {
    await new Promise(resolve => setTimeout(resolve, 10));
    results = (thunkAPI.getState() as any).entities.analysis;
  }

  return results;
})

export const selectAllInView = createAction<AnalysisResult[]>("analysis/selectAllInView");

const initialState: SelectionState = {
  selection: {} as DataTableSelection<AnalysisResult>,
};

export const selectionReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(setSelection, (state, action) => {
      state.selection = action.payload;
    })
    .addCase(updateSelectionOriginal, (state, action) => {
      const payload = action.payload;
      const payloadKeys = Object.keys(payload);
      const selectionKeys = Object.keys(state.selection);

      const intersection = payloadKeys.filter((value) =>
        selectionKeys.includes(value)
      );
      if (intersection.length === 0) {
        return;
      }

      state.selection = selectionKeys.reduce((o, k) => {
        const value = state.selection[k];
        if (payload[k]) {
          value.original = payload[k];
        }
        return {
          ...o,
          [k]: value,
        };
      }, {} as DataTableSelection<AnalysisResult>);
    })
    .addCase(clearSelection, (state) => {
      state.selection = {} as DataTableSelection<AnalysisResult>;
    })
    .addCase(selectAllInView, (state, action) => {
      state.selection = action.payload
        .map(x => {
          return ({ [x["sequence_id"]]: { original: x, cells: {} } } as DataTableSelection<AnalysisResult>)
        })
        .reduce((acc, cur) => {
          return { ...acc, ...cur }
        }, {} as DataTableSelection<AnalysisResult>)
    })
    .addCase(selectAllThunk.fulfilled, (state, action) => {
      let analysis = action.payload;

      state.selection = Object.keys(analysis)
        .map(x => {
          return ({ [x]: { original: analysis[x], cells: {} } } as DataTableSelection<AnalysisResult>);
        })
        .reduce((acc, cur) => {
          return { ...acc, ...cur }
        }, {} as DataTableSelection<AnalysisResult>);
    });
});
