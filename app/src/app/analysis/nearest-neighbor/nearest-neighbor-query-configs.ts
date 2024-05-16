import { post, BioApiJobResponse, NearestNeighborsRequest } from "sap-client";
import { getUrl } from "service";

export type NearestNeighborsResponse = {
  nnResponse: BioApiJobResponse;
};

export const getNearestNeighbors = (params: NearestNeighborsRequest) => {
  const base = post<NearestNeighborsResponse>({ body: params });

  base.url = getUrl(base.url);
  base.transform = (response: BioApiJobResponse) => {
    return {
      nnResponse: response,
    };
  };

  base.update = {
    nnResponse: (_, newValue) => newValue,
  };

  // Force a network call to be made. Making it promise as well.
  base.force = true;

  return base;
};
