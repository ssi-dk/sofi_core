import {
  NewMicroreactProjectRequest,
  NewMicroreactProjectResponse,
  sendToMicroreact as sendToMicroreactApi,
  WorkspaceInfo,
} from "sap-client";
import { getUrl } from "service";

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
