import {
  NewMicroreactProjectRequest,
  sendToMicroreact as sendToMicroreactApi
} from "sap-client";
import { getUrl } from "service";

export const sendToMicroreact = (params: NewMicroreactProjectRequest) => {
  const base = sendToMicroreactApi({ newMicroreactProjectRequest: params });
  base.url = getUrl(base.url);

  base.force = true;
  return base;
};
