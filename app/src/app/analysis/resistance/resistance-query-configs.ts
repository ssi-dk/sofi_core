import cloneDeep from "lodash.clonedeep";
import merge from "lodash.merge";
import { getSampleById, Sample } from "sap-client";
import { getUrl } from "service";

export const requestGetSampleById = (sequenceId: string) => {
  const base = getSampleById({ sequenceId });

  base.url = getUrl(base.url);

  base.transform = (response: Sample) => ({
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
