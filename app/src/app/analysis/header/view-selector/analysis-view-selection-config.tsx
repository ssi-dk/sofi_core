import { createAction, createReducer } from "@reduxjs/toolkit";
import { UserDefinedView } from 'sap-client';

const defaultView: UserDefinedView = {
    name: "Default",
    columns: [
        "analysisId",
        "isolateId",
        "testTimestamp",
        "organization",
        "dateReceived",
        "project",
        "agent",
        "species",
        "resfinderVersion",
        "serumType",
  ]
}

export const defaultViews = [defaultView];

interface SelectedViewState {
  view: UserDefinedView;
}

export const setView = createAction<UserDefinedView>(
  "view/setView"
);

export const setDefaultView = createAction("view/defaultView");

const initialState: SelectedViewState = {
    view: defaultView
};

export const viewReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(setView, (state, action) => {
      state.view = action.payload
    })
    .addCase(setDefaultView, (state) => {
      state.view = defaultView;
    });
});
