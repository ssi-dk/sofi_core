import {
  extractDataFromPi,
  ExtractDataFromPiRequest,
} from "sap-client";
import { PersonalData } from "sap-client/models/PersonalData";
import { getUrl } from "service";

export type PersonalDataExtractSlice = {
  personDataFromExtract: string;
};

export const extractPersonalData = (params: ExtractDataFromPiRequest) => {
  // use generated api client as base
  const base = extractDataFromPi<PersonalDataExtractSlice>(params);
  // template the full path for the url
  base.url = getUrl(base.url);
  base.transform = (response: PersonalData) => ({
    personDataFromExtract: response.data,
  });

  // define the update strategy for our state
  base.update = {
    personDataFromExtract: (_, newValue) => newValue
  };

  // Force a network call to be made. Making it promise as well.
  base.force = true;

  return base;
};