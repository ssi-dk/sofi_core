import {
  Column,
  getColumns,
  getAnalysis,
  GetAnalysisRequest,
  PageOfAnalysis,
  AnalysisResult,
  AnalysisResultFromJSON,
} from "sap-client";
import { getUrl } from "service";
import { arrayToNormalizedHashmap } from "utils";

export type AnalysisSlice = {
  analysisTotalCount: number;
  analysisPagingToken: string;
  analysis: { [K: string]: AnalysisResult };
};

type NormalizedColumnCollection = { [K: string]: Column };

export type ColumnSlice = {
  columns: NormalizedColumnCollection;
};

// query config for retrieving a page of analysis
export const requestPageOfAnalysis = (params: GetAnalysisRequest) => {
  // use generated api client as base
  const base = getAnalysis<AnalysisSlice>(params);
  // template the full path for the url
  base.url = getUrl(base.url);
  // define a transform for normalizing the data into our desired state
  base.transform = (response: PageOfAnalysis) => ({
    analysisTotalCount: response.totalCount,
    analysisPagingToken: response.pagingToken,
    analysis: response.items
      ? arrayToNormalizedHashmap(response.items.map((a) => AnalysisResultFromJSON(a)), "isolate_id")
      : {},
  });
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

export const requestColumns = () => {
  // use generated api client as base
  const base = getColumns<ColumnSlice>();
  // template the full path for the url
  base.url = `${window.location.protocol}//${window.location.host}/api/${base.url}`;
  // define a transform for normalizing the data into our desired state
  base.transform = (response: Column[]) => ({
    columns: arrayToNormalizedHashmap(response, "field_name"),
  });
  // define the update strategy for our state
  base.update = {
    columns: (_, newValue) => newValue,
  };
  return base;
};
