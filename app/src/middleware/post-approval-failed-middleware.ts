import { actionTypes } from "redux-query";

const { MUTATE_FAILURE } = actionTypes;

/**
 * On successful approval, fetch the updated analysis result(s)
 */
export const postApprovalFailedMiddleware = (store) => (next) => (action) => {
  if (
    action &&
    action.type === MUTATE_FAILURE &&
    action.url?.endsWith("/api/approvals")
  ) {
    // Dispatch an action to save the error response body
    store.dispatch({
      type: "Approval_Failed",
      payload: {
        message: action.responseBody?.detail || "Approval failed",
        timestamp: new Date().toISOString(),
        url: action.url,
      },
    });
  }
  next(action);
};
