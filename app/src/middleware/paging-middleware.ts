import { actionTypes, requestAsync } from "redux-query";
import { requestPageOfAnalysis } from "app/analysis/analysis-query-configs";

const { REQUEST_SUCCESS } = actionTypes;

export const pagingMiddleware = (store) => (next) => (action) => {
  if (action && action.type === REQUEST_SUCCESS) {
    // ugly hack
    console.log("henlo");
    if (action.url.indexOf("/api/analysis") > -1) {
      // we want to page the analysis results automatically
      console.log("uwu wats dis");
      const pagingToken = action.responseBody.paging_token;
      if (pagingToken) {
        console.log("oo a page");
        console.log(pagingToken);
        store.dispatch(
          requestAsync({ ...requestPageOfAnalysis({ pagingToken }) })
        );
      }
    }
  }
  // Proceed as normal
  next(action);
};
