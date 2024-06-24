import cloneDeep from "lodash.clonedeep";
import merge from "lodash.merge";
import { getSampleById, Sample } from "sap-client";
import { getUrl } from "service";

export const requestGetSampleById = (sampleId: string) => {
  const base = getSampleById({ sampleId });

  base.url = getUrl(base.url);

  base.transform = (response: Sample) => ({
    samples: { [sampleId]: response },
  });

  base.update = {
    samples: (oldValue, newValue) => {
      return merge({}, cloneDeep(oldValue), newValue);
    },
  };

  base.force = true;
  return base;
};
