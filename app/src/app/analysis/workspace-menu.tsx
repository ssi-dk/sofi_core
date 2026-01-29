import React, { useMemo, useState, useEffect, useRef } from "react";
import { requestAsync } from "redux-query";
import {
  Flex,
  Button,
  IconButton,
  Menu,
  MenuList,
  MenuButton,
  Input,
} from "@chakra-ui/react";
import { AnalysisResult, Workspace } from "sap-client";
import {
  HamburgerIcon,
  AddIcon,
  DeleteIcon,
  CheckIcon,
  MinusIcon,
  NotAllowedIcon,
  StarIcon,
  UserInfo
} from "@chakra-ui/icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "app/root-reducer";
import { DataTableSelection } from "./data-table/data-table";
import { useMutation } from "redux-query-react";
import {
  setWorkspaceFavorite,
  leaveWorkspace,
  searchWorkspaces,
  joinWorkspace,
} from "../workspaces/workspaces-query-configs";

import { WsTag } from "./ws-tag";

export type WorkspaceMenuProps = {
  workspaces: Workspace[];
  workspace: Workspace;
  selection: DataTableSelection<AnalysisResult>;
  addToWorkspace: (id: string) => void;
  removeFromWorkspace: (id: string) => void;
  setWorkspace: (w: Workspace) => void;
};

export const WorkspaceMenu = (props: WorkspaceMenuProps) => {
  const {
    workspaces,
    workspace,
    selection,
    addToWorkspace,
    removeFromWorkspace,
    setWorkspace,
  } = props;

  const user = useSelector<RootState>((s) => s.entities.user ?? {}) as UserInfo;
  const dispatch = useDispatch();

  const [, leaveWs] = useMutation((workspaceId: string) => {
    return leaveWorkspace({
      workspaceId,
    });
  });

  const [, setFavorite] = useMutation(
    (workspaceId: string, isFavorite: boolean) => {
      return setWorkspaceFavorite({
        setFavorite: {
          workspaceId,
          isFavorite,
        },
      });
    }
  );

  const [, joinWs] = useMutation((workspaceToJoin: Workspace) => {
    return joinWorkspace(workspaceToJoin);
  })

  const [searchStr, setSearchStr] = useState("");

  const searchStrRef = useRef({ str: "" });

  useEffect(() => {
    if (searchStr) {
      searchStrRef.current.str = searchStr;
      const TIMEOUT = 250;
      // We want to wait until the user is done writing. We only dispatch a request when is has not changed for {TIMEOUT} ms
      setTimeout(() => {
        if (searchStrRef.current.str === searchStr) {
          // We wait {TIMEOUT} ms, then if the searchstring has not changed, do dispatch.
          dispatch(
            requestAsync(
              searchWorkspaces({
                workspaceSearchQuery: { searchString: searchStr },
              })
            )
          );
        }
      }, TIMEOUT);
    } else {
    }
  }, [searchStr, dispatch]);

  const rawSearchRes = useSelector<RootState>((s) =>
    Object.values(s.entities.wsSearch ?? [])
  ) as Array<Workspace>;

  const displayWorkspaces = useMemo(
    () =>
      workspaces
        .filter(
          (w) =>
            !searchStr ||
            w.name.toLowerCase().includes(searchStr.toLowerCase()) ||
            w.tags.find((t) =>
              t.toLowerCase().includes(searchStr.toLowerCase())
            )
        )
        .sort((a, b) => Number(b.isFavorite) - Number(a.isFavorite)),
    [workspaces, searchStr]
  );

  const searchRes = rawSearchRes.filter(
    (ws) => !workspaces.find((dws) => dws.id === ws.id)
  );

  return (
    <Menu>
      <MenuButton
        style={{ minWidth: "8rem" }}
        marginX={2}
        paddingX={2}
        as={Button}
        leftIcon={<HamburgerIcon />}
      >
        Workspaces
      </MenuButton>
      <MenuList
        style={{ maxHeight: "30rem", minWidth: "20rem", overflowY: "scroll" }}
      >
        <Input
          style={{ width: "calc(100% - 1rem)", marginBottom: "0.5rem" }}
          marginX={2}
          variant="outline"
          placeholder="Search for workspaces"
          onChange={(e) => setSearchStr(e.target.value)}
        />
        {searchStr && displayWorkspaces.length && (
          <h3 style={{ fontSize: "20px", marginLeft: "0.5rem" }}>
            <b>My workspaces</b>
          </h3>
        )}
        {displayWorkspaces.map((w) => {
          const fullySelected = Object.values(selection)
            .map((sv) => sv.original.id)
            .every((id) => w.samples.find((sid) => sid === id));

          const isCurrent = w.id === workspace?.id;

          const wsStyle = isCurrent
            ? { backgroundColor: "#DDE3E7", borderRadius: "6px" }
            : undefined;

          return (
            <div key={w.id} style={wsStyle}>
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Flex direction="row" style={{ flexGrow: 1 }} align="center">
                  <IconButton
                    aria-label="Pin workspace as favorite"
                    icon={
                      <StarIcon
                        {...(w.isFavorite
                          ? { color: "gold" }
                          : { fillOpacity: 0, stroke: "black" })}
                      />
                    }
                    ml="1"
                    onClick={() => setFavorite(w.id, !w.isFavorite)}
                    style={{ margin: "4px" }}
                  />
                  <Button
                    style={{
                      flexGrow: 1,
                      margin: "4px",
                      padding: "4px",
                      height: "fit-content",
                      minHeight: "2.5rem",
                    }}
                    onClick={() => {
                      setWorkspace(w);
                    }}
                  >
                    <Flex direction="column">
                      {w.name}
                      <Flex
                        direction="row"
                        wrap="wrap"
                        style={{ maxWidth: "14rem" }}
                      >
                        {w.tags.map((tag) => (
                          <WsTag key={tag} tag={tag} />
                        ))}
                      </Flex>
                    </Flex>
                  </Button>
                </Flex>
                <div>
                  {Object.values(selection).length > 0 && (
                    <>
                      <IconButton
                        aria-label="add selection to workspace"
                        disabled={fullySelected}
                        marginX={1}
                        onClick={(e) => {
                          addToWorkspace(w.id);
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        icon={fullySelected ? <CheckIcon /> : <AddIcon />}
                      />
                      <IconButton
                        aria-label="remove selection from workspace"
                        disabled={!fullySelected}
                        marginX={1}
                        onClick={(e) => {
                          removeFromWorkspace(w.id);
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        icon={
                          fullySelected ? <MinusIcon /> : <NotAllowedIcon />
                        }
                      />
                    </>
                  )}
                  {/* <EditIcon margin={2} /> */}
                  <IconButton
                    aria-label="leave workspace"
                    icon={<DeleteIcon />}
                    margin={2}
                    onClick={() => {
                      if (
                        confirm(
                          "Are you sure you want to leave this workspace."
                        )
                      ) {
                        leaveWs(w.id);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}

        {searchStr && (
          <h3 style={{ fontSize: "20px", marginLeft: "0.5rem" }}>
            <b>{user.institution} workspaces</b>
          </h3>
        )}
        {searchStr &&
          searchRes.map((w) => (
            <Flex direction="row" key={w.id}>
              <Button
                style={{
                  flexGrow: 1,
                  margin: "4px",
                  padding: "4px",
                  height: "fit-content",
                  minHeight: "2.5rem",
                }}
                onClick={() => {
                  if (confirm("Join workspace?")) {
                    joinWs(w);
                  }
                }}
              >
                <Flex direction="column">
                  {w.name}
                  <Flex
                    direction="row"
                    wrap="wrap"
                    style={{ maxWidth: "14rem" }}
                  >
                    {w.tags.map((tag) => (
                      <WsTag key={tag} tag={tag} />
                    ))}
                  </Flex>
                </Flex>
              </Button>
            </Flex>
          ))}
      </MenuList>
    </Menu>
  );
};
