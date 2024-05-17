import { post, BioApiJobResponse, NearestNeighborsRequest } from "sap-client";
import { getUrl } from "service";

export type NearestNeighborsResponseSlice = {
  nearestNeighborsResponse: BioApiJobResponse;
};

export const getNearestNeighbors = (params: NearestNeighborsRequest) => {
  const base = post<NearestNeighborsResponseSlice>({ body: params });

  base.url = getUrl(base.url);
  base.transform = (response: BioApiJobResponse) => {
    return {
      nearestNeighborsResponse: response,
    };
  };

  base.update = {
    nearestNeighborsResponse: (_, newValue) => newValue,
  };

  // Force a network call to be made. Making it promise as well.
  base.force = true;

  return base;
};
