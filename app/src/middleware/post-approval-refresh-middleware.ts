import { actionTypes, requestAsync } from "redux-query";
import { requestAnalysis } from "app/analysis/analysis-query-configs";

const { MUTATE_SUCCESS } = actionTypes;

/**
 * On successful approval, fetch the updated analysis result(s)
 */
export const postApprovalRefreshMiddleware = (store) => (next) => (action) => {
  if (
    action &&
    action.type === MUTATE_SUCCESS &&
    action.url?.endsWith("/api/approvals")
  ) {
    Object.keys(action.body.matrix).map((s) => {
      store.dispatch(requestAsync({ ...requestAnalysis({ sequenceId: s }) }));
    });
  }
  next(action);
};
