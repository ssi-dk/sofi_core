import {
  searchAnalysis,
  AnalysisResult,
  SearchAnalysisRequest,
  PageOfAnalysis,
  AnalysisResultFromJSON,
} from "sap-client";
import { PersonalData } from "sap-client/models/PersonalData";
import { getUrl } from "service";
import { arrayToNormalizedHashmap } from "utils";


export type IsolateWithData = { [K: string]: AnalysisResult };

export type AnalysisHistorySlice = {
  analysisHistory: IsolateWithData;
};

export const sequencesFromIsolateId = (isolateId: string) => {
  // use generated api client as base
  const params = { query: { filters: { "isolate_id": isolateId } } } as SearchAnalysisRequest
  const base = searchAnalysis<AnalysisHistorySlice>(params);
  // template the full path for the url
  base.url = getUrl(base.url);
  // define a transform for normalizing the data into our desired state
  base.transform = (response: PageOfAnalysis) => ({
    analysisHistory: response.items
      ? arrayToNormalizedHashmap(response.items.map((a) => AnalysisResultFromJSON(a)), "sequence_id")
      : {},
  });
  // define the update strategy for our state
  base.update = {
    analysisHistory: (_, newValue) => ({
      ...newValue,
    }),
  };
  base.force = true;
  return base;
};