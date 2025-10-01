import {
  NewickTreeResponse,
  getComparativeNewickData,
  GetComparativeNewickDataRequest,
} from "sap-client";
import { getUrl } from "service";

export type ComparativeAnalysisNewickSlice = {
  ComparativeAnalysisNewick: string;
};

export const getComparativeAnalysisNewick = (jobId: string) => {
  const newickRequest = { jobId } as GetComparativeNewickDataRequest;

  const base = getComparativeNewickData<ComparativeAnalysisNewickSlice>(
    newickRequest
  );

  base.url = getUrl(base.url);

  base.transform = (response: NewickTreeResponse) => ({
    ComparativeAnalysisNewick: response.tree,
  });

  base.update = {
    ComparativeAnalysisNewick: (_, newValue) => newValue,
  };

  return base;
};
