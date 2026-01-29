import {
  getWorkspaces,
  Workspace,
  leaveWorkspace as leaveWorkspaceApi,
  createWorkspace as createWorkspaceApi,
  createWorkspaceFromSequenceIds as createWorkspaceFromSequenceIdsApi,
  getWorkspace as getWorkspaceApi,
  postWorkspace as postWorkspaceApi,
  deleteWorkspaceSample as deleteWorkspaceSampleApi,
  LeaveWorkspaceRequest,
  PostWorkspaceRequest,
  DeleteWorkspaceSampleRequest,
  cloneWorkspace as cloneWorkspaceApi,
  removeWorkspaceSamples as removeWorkspaceSamplesApi,
  setWsFavorite as setFavoriteApi,
  SetWsFavoriteRequest,
  getTags as getTagsApi,
  setTag as setTagApi,
  SetTagRequest,
  wsSearch as wsSearchApi,
  WsSearchRequest,
  joinWorkspace as joinWorkspaceApi,
  JoinWorkspaceRequest,
} from "sap-client";
import {
  CreateWorkspace,
  WorkspaceInfo,
  CloneWorkspace,
} from "sap-client/models";
import { getUrl } from "service";

export type WorkspacesSlice = {
  workspaces: Array<Workspace>;
};

export type WorkspaceSlice = {
  workspace: WorkspaceInfo;
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

export const getWorkspace = (id: string) => {
  const base = getWorkspaceApi<WorkspaceSlice>({ workspaceId: id });

  base.url = getUrl(base.url);

  base.transform = (response: WorkspaceInfo) => ({
    workspace: response,
  });

  base.update = {
    workspace: (_, newValue) => newValue,
  };
  base.force = true;
  return base;
};

export const leaveWorkspace = (params: LeaveWorkspaceRequest) => {
  const base = leaveWorkspaceApi(params);
  base.url = getUrl(base.url);
  base.update = {
    workspaces: (oldValue) => {
      const newValue = oldValue.filter(
        (workspace) => workspace.id !== params.workspaceId
      );
      return newValue;
    },
  };
  base.force = true;
  return base;
};

export const removeWorkspaceSample = (params: DeleteWorkspaceSampleRequest) => {
  const base = deleteWorkspaceSampleApi(params);
  base.url = getUrl(base.url);
  base.update = {
    workspace: (oldValue) => {
      return {
        ...oldValue,
        samples: oldValue.samples.filter((s) => s.id !== params.sampleId),
      };
    },
  };
  base.force = true;
  return base;
};

export const createWorkspace = (params: CreateWorkspace, userInst: string) => {
  const base = createWorkspaceApi({ createWorkspace: params });
  base.url = getUrl(base.url);

  base.transform = (response) => {
    if (!response.id) {
      return undefined;
    }
    return {
      workspaces: [
        {
          id: response.id,
          name: params.name,
          samples: params.samples,
          tags: [],
          institution: userInst,
        },
      ],
    };
  };

  base.update = {
    workspaces: (oldValue, newValue) => {
      if (!newValue) {
        return oldValue;
      }
      return [].concat(...oldValue, ...newValue);
    },
  };
  base.force = true;
  return base;
};

export const createWorkspaceFromSequenceIds = (params: CreateWorkspace) => {
  const base = createWorkspaceFromSequenceIdsApi({ createWorkspace: params });
  base.url = getUrl(base.url);

  base.transform = (response) => {
    if (!response.id) {
      return undefined;
    }
    return { workspaces: [{ id: response.id, name: params.name }] };
  };

  base.update = {
    workspaces: (oldValue, newValue) => {
      if (!newValue) {
        return oldValue;
      }
      return [].concat(...oldValue, ...newValue);
    },
  };
  base.force = true;
  return base;
};

export const cloneWorkspace = (
  params: CloneWorkspace & { samples: string[] }
) => {
  const base = cloneWorkspaceApi({ cloneWorkspace: params });
  base.url = getUrl(base.url);

  base.transform = (response) => {
    if (!response.id) {
      return undefined;
    }
    return {
      workspaces: [
        { id: response.id, name: params.name, samples: params.samples },
      ],
    };
  };

  base.update = {
    workspaces: (oldValue, newValue) => {
      if (!newValue) {
        return oldValue;
      }
      return [].concat(...oldValue, ...newValue);
    },
  };
  base.force = true;
  return base;
};

export const updateWorkspace = (params: PostWorkspaceRequest) => {
  const base = postWorkspaceApi(params);
  base.url = getUrl(base.url);

  base.update = {
    workspaces: (oldValue) => {
      return oldValue.map((ws) => {
        if (ws.id != params.workspaceId) {
          return ws;
        }
        return {
          ...ws,
          samples: [
            ...new Set([...ws.samples, ...params.updateWorkspace.samples]),
          ],
        };
      });
    },
  };
  base.force = true;
  return base;
};

export const removeWorkspaceSamples = (params: PostWorkspaceRequest) => {
  const base = removeWorkspaceSamplesApi(params);
  base.url = getUrl(base.url);

  base.update = {
    workspaces: (oldValue) => {
      return oldValue.map((ws) => {
        if (ws.id != params.workspaceId) {
          return ws;
        }
        return {
          ...ws,
          samples: ws.samples.filter(
            (sid) => !params.updateWorkspace.samples.find((rid) => sid === rid)
          ),
        };
      });
    },
  };
  base.force = true;
  return base;
};

export const setWorkspaceFavorite = (params: SetWsFavoriteRequest) => {
  const base = setFavoriteApi(params);
  base.url = getUrl(base.url);

  base.update = {
    workspaces: (oldValue) => {
      const { workspaceId, isFavorite } = params.setFavorite;

      return oldValue.map((ws) => {
        if (ws.id !== workspaceId) {
          return ws;
        }
        return {
          ...ws,
          isFavorite,
        };
      });
    },
  };

  base.force = true;
  return base;
};

export const fetchWorkspaceTags = () => {
  const base = getTagsApi();
  base.url = getUrl(base.url);

  base.transform = (response: Array<string>) => ({
    tags: response,
  });

  base.update = {
    tags: (_, newValue) => newValue,
  };
  base.force = true;
  return base;
};

export const setWorkspaceTag = (params: SetTagRequest) => {
  const base = setTagApi(params);
  base.url = getUrl(base.url);

  base.update = {
    workspaces: (oldValue) => {
      const { workspaceId, tag, addOrRemove } = params.setWsTag;

      return oldValue.map((ws: Workspace) => {
        if (ws.id !== workspaceId) {
          return ws;
        }
        return {
          ...ws,
          tags: addOrRemove
            ? [tag, ...ws.tags]
            : ws.tags.filter((t) => t !== tag),
        };
      });
    },
  };

  base.force = true;
  return base;
};

export const searchWorkspaces = (params: WsSearchRequest) => {
  const base = wsSearchApi(params);
  base.url = getUrl(base.url);

  base.transform = (response: Array<Workspace>) => {
    return {
      wsSearch: response,
    };
  };
  base.update = {
    wsSearch: (_, newValue) => newValue,
  };
  base.force = true;
  return base;
};

export const joinWorkspace = (workspace: Workspace) => {
  const base = joinWorkspaceApi({ workspaceId: workspace.id });
  base.url = getUrl(base.url);

  base.update = {
    workspaces: (oldValue) => {
      return [...oldValue, workspace];
    },
  };
  return base;
};
