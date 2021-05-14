import { actionTypes, requestAsync } from "redux-query";
import { requestPageOfAnalysis } from "app/analysis/analysis-query-configs";

const { REQUEST_SUCCESS } = actionTypes;

export const pagingMiddleware = (store) => (next) => (action) => {
  if (action && action.type === REQUEST_SUCCESS) {
    // ugly hack
    if (action.url.indexOf("/api/analysis") > -1) {
      console.log(action);
      if (action.entities.autoPage) {
        // we want to page the analysis results automatically
        const pagingToken = action.responseBody.paging_token;
        if (pagingToken) {
          store.dispatch(
            requestAsync({ ...requestPageOfAnalysis({ pagingToken }) })
          );
        }
      }
    }
  }
  // Proceed as normal
  next(action);
};
