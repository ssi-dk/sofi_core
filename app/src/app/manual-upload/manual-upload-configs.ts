import { SingleUploadRequest, singleUpload } from "sap-client";
import { getUrl } from "service";

export const uploadIsolateFile = (req: SingleUploadRequest) => {
  const base = singleUpload<void>(req);
  base.url = getUrl(base.url);
  return base;
};
