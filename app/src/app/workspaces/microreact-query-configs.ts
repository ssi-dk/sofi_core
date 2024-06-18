import {
  NewMicroreactProjectRequest,
  sendToMicroreact as sendToMicroreactApi,
} from "sap-client";
import { getUrl } from "service";

export const sendToMicroreact = (body: NewMicroreactProjectRequest) => {
  const base = sendToMicroreactApi({ body });
  base.url = getUrl(base.url);

  base.force = true;
  return base;
};
