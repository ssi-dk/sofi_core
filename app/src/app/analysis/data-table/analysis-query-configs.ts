import {
  Analysis,
  getAnalysis,
  GetAnalysisRequest,
  PageOfAnalysis,
} from "sap-client";
import { getUrl } from "service";
import { arrayToNormalizedHashmap } from "utils";

type AnalysisSlice = {
  analysisTotalCount: number;
  analysisPagingToken: string;
  analysis: { [K: string]: Analysis };
};

// query config for retrieving a page of analysis
export const requestPageOfAnalysis = (params: GetAnalysisRequest) => {
  // use generated api client as base
  const base = getAnalysis<AnalysisSlice>(params);
  // template the full path for the url
  base.url = getUrl(base.url);
  // define a transform for normalizing the data into our desired state
  base.transform = (response: PageOfAnalysis) =>
    ({
      analysisTotalCount: response.totalCount,
      analysisPagingToken: response.pagingToken,
      analysis: response.items
        ? arrayToNormalizedHashmap(response.items, "analysisId")
        : {},
    } as any);
  // define the update strategy for our state
  base.update = {
    analysisTotalCount: (_, newValue) => newValue,
    analysisPagingToken: (_, newValue) => newValue,
    analysis: (oldValue, newValue) => ({
      ...oldValue,
      ...newValue,
    }),
  };
  return base;
};

export default requestPageOfAnalysis;
