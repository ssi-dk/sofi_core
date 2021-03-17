import { forgetPii, ForgetPiiRequest } from "sap-client";
import { PersonalData } from "sap-client/models/PersonalData";
import { getUrl } from "service";

export type ForgetPiiResponse = {
  forgetPiiResponse: string;
};

export const forgetPersonalData = (params: ForgetPiiRequest) => {
  // use generated api client as base
  const base = forgetPii<ForgetPiiResponse>(params);
  // template the full path for the url
  base.url = getUrl(base.url);
  base.transform = (response: PersonalData) => ({
    forgetPiiResponse: response.data,
  });

  // define the update strategy for our state
  base.update = {
    forgetPiiResponse: (_, newValue) => newValue,
  };

  // Force a network call to be made. Making it promise as well.
  base.force = true;

  return base;
};
