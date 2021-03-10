import {
  reloadMetadata,
  MetadataReloadRequest,
  MetadataReloadResponse,
  AnalysisResult,
  Organization,
} from "sap-client";
import { getUrl } from "service";

export type ReloadMetadataSlice = {
  reloadResponse: MetadataReloadResponse;
};

export const reloadMetadataByIsolate = (
  isolateId: string,
  institution: Organization
) => {
  // use generated api client as base
  const req: MetadataReloadRequest = { isolateId, institution };
  const base = reloadMetadata<ReloadMetadataSlice>({ body: req });
  // template the full path for the url
  base.url = getUrl(base.url);
  // define the update strategy for our state
  base.update = {
    reloadResponse: (_, newValue) => ({
      ...newValue,
    }),
  };
  //base.force = true;
  return base;
};
