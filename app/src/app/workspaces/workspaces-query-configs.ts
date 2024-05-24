import {
  getWorkspaces,
  Workspace,
  deleteWorkspace as deleteWorkspaceApi,
  DeleteWorkspaceRequest,
} from "sap-client";
import { getUrl } from "service";

export type WorkspacesSlice = {
  workspaces: Array<Workspace>;
};

export const fetchWorkspaces = () => {
  const base = getWorkspaces<WorkspacesSlice>();

  base.url = getUrl(base.url);

  base.transform = (response: Array<Workspace>) => ({
    workspaces: response,
  });

  base.update = {
    workspaces: (_, newValue) => newValue,
  };
  base.force = true;
  return base;
};

export const deleteWorkspace = (params: DeleteWorkspaceRequest) => {
  const base = deleteWorkspaceApi(params);
  base.url = getUrl(base.url);
  base.update = {
    workspaces: (oldValue) => {
      const newValue = oldValue.filter(workspace => workspace.id !== params.workspaceId);
      return newValue;
    },
  };
  base.force = true;
  return base;
};
