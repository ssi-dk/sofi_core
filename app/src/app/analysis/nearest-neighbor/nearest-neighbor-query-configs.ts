import {
  createAction,
  createReducer,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import {
  post,
  NearestNeighborsResponse,
  NearestNeighborsRequest,
} from "sap-client";
import { getUrl } from "service";

export type NearestNeighborsResponseSlice = {
  nearestNeighborsResponses: Record<string, NearestNeighborsResponse>;
};

export function serializeNNRequest(req: NearestNeighborsRequest): string {
  const sorted = Object.keys(req)
    .sort()
    .reduce((obj, key) => {
      obj[key] = req[key as keyof NearestNeighborsRequest];
      return obj;
    }, {} as NearestNeighborsRequest);

  return JSON.stringify(sorted);
}

export const getNearestNeighbors = (params: NearestNeighborsRequest) => {
  const base = post<NearestNeighborsResponseSlice>({ body: params });

  base.url = getUrl(base.url);
  base.transform = (response: NearestNeighborsResponse) => {
    const index = serializeNNRequest(params);
    const resp = {};
    resp[index] = response;
    return {
      nearestNeighborsResponses: resp,
    };
  };

  base.update = {
    nearestNeighborsResponses: (oldValue, newValue) =>
      //Object.assign(newValue, oldValue ?? {}), // Is the order correct??
      Object.assign(oldValue ?? {}, newValue), 
  };

  // Force a network call to be made. Making it promise as well.
  base.force = true;

  return base;
};
