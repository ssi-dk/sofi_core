import cloneDeep from "lodash.clonedeep";
import merge from "lodash.merge";
import {
  Column,
  getColumns,
  getAnalysis,
  GetAnalysisRequest,
  PageOfAnalysis,
  AnalysisResult,
  AnalysisResultFromJSON,
  SearchAnalysisRequest,
  searchAnalysis,
  submitChanges,
  ApprovalStatus,
  SubmitChangesRequest,
  GetSequenceByIdRequest,
  getSequenceById,
} from "sap-client";
import { getUrl } from "service";
import { arrayToNormalizedHashmap } from "utils";

export type AnalysisSlice = {
  analysisTotalCount: number;
  analysisPagingToken: string;
  autoPage: boolean;
  analysis: { [K: string]: AnalysisResult };
  approvalMatrix: { [K: string]: { [K: string]: ApprovalStatus } };
};

type NormalizedColumnCollection = { [K: string]: Column };

export type ColumnSlice = {
  columns: NormalizedColumnCollection;
};

export const requestAnalysis = (params: GetSequenceByIdRequest) => {
  const base = getSequenceById<AnalysisSlice>(params);
  base.url = getUrl(base.url);
  base.transform = (response: AnalysisResult) => ({
    analysis: response
      ? arrayToNormalizedHashmap(
          [AnalysisResultFromJSON(response)],
          "sequence_id"
        )
      : {},
  });
  base.update = {
    analysis: (oldValue, newValue) => ({
      ...oldValue,
      ...newValue,
    }),
  };
  base.force = true;
  return base;
};

// query config for retrieving a page of analysis
export const requestPageOfAnalysis = (
  params: GetAnalysisRequest,
  autoPage: boolean = true
) => {
  // use generated api client as base
  const base = getAnalysis<AnalysisSlice>(params);
  // template the full path for the url
  base.url = getUrl(base.url);
  // define a transform for normalizing the data into our desired state
  base.transform = (response: PageOfAnalysis) => ({
    lastPage:
      response.paging_token !== null && response.paging_token !== undefined,
    analysisTotalCount: response.total_count,
    analysisPagingToken: response.paging_token,
    approvalMatrix: response.approval_matrix,
    autoPage,
    analysis: response.items
      ? arrayToNormalizedHashmap(
          response.items.map((a) => AnalysisResultFromJSON(a)),
          "sequence_id"
        )
      : {},
  });
  // define the update strategy for our state
  base.update = {
    analysisTotalCount: (_, newValue) => newValue,
    analysisPagingToken: (_, newValue) => newValue,
    autoPage: (_, newValue) => newValue,
    approvalMatrix: (oldValue, newValue) => ({
      ...oldValue,
      ...newValue,
    }),
    analysis: (oldValue, newValue) => ({
      ...oldValue,
      ...newValue,
    }),
  };
  base.force = true;
  return base;
};

// query config for retrieving a page of analysis
export const searchPageOfAnalysis = (
  params: SearchAnalysisRequest,
  autoPage: boolean = true
) => {
  // use generated api client as base
  const base = searchAnalysis<AnalysisSlice>(params);
  // template the full path for the url
  base.url = getUrl(base.url);
  // define a transform for normalizing the data into our desired state
  base.transform = (response: PageOfAnalysis) => ({
    analysisTotalCount: response.total_count,
    analysisPagingToken: response.paging_token,
    approvalMatrix: response.approval_matrix,
    autoPage,
    analysis: response.items
      ? arrayToNormalizedHashmap(
          response.items.map((a) => AnalysisResultFromJSON(a)),
          "sequence_id"
        )
      : {},
  });
  // define the update strategy for our state
  base.update = {
    analysisTotalCount: (_, newValue) => newValue,
    analysisPagingToken: (_, newValue) => newValue,
    autoPage: (_, newValue) => newValue,
    approvalMatrix: (oldValue, newValue) => ({
      ...oldValue,
      ...newValue,
    }),
    analysis: (oldValue, newValue) => ({
      ...oldValue,
      ...newValue,
    }),
  };
  base.force = true;
  return base;
};

export const requestColumns = () => {
  // use generated api client as base
  const base = getColumns<ColumnSlice>();
  // template the full path for the url
  base.url = getUrl(base.url);
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

type SubmitChangesBody = { [K: string]: { [K: string]: string } };

export const updateAnalysis = (change: SubmitChangesBody) => {
  const base = submitChanges<AnalysisSlice>({ body: change });
  base.url = getUrl(base.url);
  base.transform = (response: AnalysisSlice) => ({ analysis: response } as any);
  base.update = {
    analysis: (oldValue, newValue) => {
      return merge({}, cloneDeep(oldValue), newValue);
    },
  };
  base.force = true;
  return base;
};
