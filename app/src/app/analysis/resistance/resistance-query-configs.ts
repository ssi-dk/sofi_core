import cloneDeep from "lodash.clonedeep";
import merge from "lodash.merge";
import { getSampleById } from "sap-client";
import { getUrl } from "service";

export const requestGetSampleById = (sequenceId: string) => {
  const base = getSampleById({ sequenceId });

  base.url = getUrl(base.url);

  // TODO: change any to response type
  base.transform = (response: any) => ({
    samples: { [sequenceId]: response },
  });

  base.update = {
    samples: (oldValue, newValue) => {
      return merge({}, cloneDeep(oldValue), newValue);
    },
  };

  base.force = true;
  return base;
};
