import { actionTypes } from "redux-query";
import { updateSelectionOriginal } from "app/analysis/analysis-selection-configs";

const { MUTATE_SUCCESS, REQUEST_SUCCESS } = actionTypes;

export const selectionMiddleware = (store) => (next) => (action) => {
  if (
    action.type === MUTATE_SUCCESS &&
    action.url.indexOf("/api/analysis/changes") !== -1
  ) {
    // When analysis are updated, dispatch action to maintain the original selection state
    store.dispatch(updateSelectionOriginal(action.responseBody));
  }

  if (
    action.type === REQUEST_SUCCESS &&
    action.url.indexOf("/api/analysis/by_id") !== -1
  ) {
    // When analysis are approved, dispatch action to maintain the original selection state
    const id = action.body.sequence_id;
    const payload = {};
    payload[id] = action.responseBody;
    store.dispatch(updateSelectionOriginal(payload));
  }

  next(action);
};
