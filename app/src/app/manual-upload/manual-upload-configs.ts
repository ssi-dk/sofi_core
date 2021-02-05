import { IsolateUploadRequest, isolateUpload } from "sap-client";
import { getUrl } from "service";

export const uploadIsolateFile = (req: IsolateUploadRequest) => {
  const base = isolateUpload<void>(req);
  base.url = getUrl(base.url);
  return base;
};
