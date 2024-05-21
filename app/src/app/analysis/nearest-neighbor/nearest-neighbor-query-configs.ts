import { post, NearestNeighborsResponse, NearestNeighborsRequest } from "sap-client";
import { getUrl } from "service";

export type NearestNeighborsResponseSlice = {
  nearestNeighborsResponses: Record<string, NearestNeighborsResponse>;
};

export const getNearestNeighbors = (params: NearestNeighborsRequest) => {
  const base = post<NearestNeighborsResponseSlice>({ body: params });

  base.url = getUrl(base.url);
  base.transform = (response: NearestNeighborsResponse) => {
    const resp = {};
    resp[params.id] = response;
    return {
      nearestNeighborsResponses: resp,
    };
  };

  base.update = {
    nearestNeighborsResponses: (oldValue, newValue) => Object.assign(newValue, oldValue ?? {}),
  };

  // Force a network call to be made. Making it promise as well.
  base.force = true;

  return base;
};
