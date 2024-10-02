import {
  NewMicroreactProjectRequest,
  NewMicroreactProjectResponse,
  sendToMicroreact as sendToMicroreactApi,
  getMicroreactUrl as getMicroreactUrlApi,
  WorkspaceInfo,
} from "sap-client";
import { getUrl } from "service";

export type UrlSlice = {
  url: string;
};

export const sendToMicroreact = (body: NewMicroreactProjectRequest) => {
  const base = sendToMicroreactApi({ body });
  base.url = getUrl(base.url);

  base.force = true;

  base.transform = (response: NewMicroreactProjectResponse) => {
    return {
      workspace: response,
    };
  };

  base.update = {
    workspace: (
      oldValue: WorkspaceInfo,
      newValue: NewMicroreactProjectResponse
    ) => {
      return Object.assign({}, oldValue, { microreact: newValue });
    },
  };

  return base;
};

export const getMicroreactUrl = () => {
  const base = getMicroreactUrlApi<UrlSlice>();

  base.url = getUrl(base.url);

  base.transform = (response: UrlSlice) => ({
    url: response.url,
  });

  base.update = {
    url: (_, newValue) => newValue,
  };
  base.force = true;
  return base;
};
