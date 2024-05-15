import { BioApiJobResponse, NearestNeighborsRequest, post } from "sap-client";
import { getUrl } from "service";

// TODO
export const nearestNeighborsRequest = (request: NearestNeighborsRequest) => {
  const base = post({ body: request });

  base.url = getUrl(base.url);

  base.transform = (response: BioApiJobResponse) => {
    return {};
  };

  // base.update = {
  //   health: (oldValue, newValue) => {
  //     return merge({}, cloneDeep(oldValue), newValue);
  //   },
  // };

  base.force = true;
  return base;
};
