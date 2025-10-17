import { createAction, createReducer } from "@reduxjs/toolkit";

export const setFailedApproval = createAction<string>("Approval_Failed");

const initialState = {
  lastApprovalError: null
};

export const judgmentReducer = createReducer(initialState, (builder) => {
  return builder.addCase(setFailedApproval, (state, action) => {
    state.lastApprovalError = action.payload;
  });
});
