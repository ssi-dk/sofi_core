import { actionTypes } from "redux-query";
import { updateSelectionOriginal } from "app/analysis/analysis-selection-configs";

const { MUTATE_SUCCESS } = actionTypes;

export const selectionMiddleware = (store) => (next) => (action) => {
  if (action.type !== MUTATE_SUCCESS ||
    action.url.indexOf("/api/analysis/changes") === -1) {
    next(action);
    return;
  }

  // Dispatch actions to maintain the original selection state
  store.dispatch(updateSelectionOriginal(action.responseBody));

  next(action);
};
