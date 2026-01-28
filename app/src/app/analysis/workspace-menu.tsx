import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Box,
  Flex,
  Editable,
  EditablePreview,
  EditableInput,
  Skeleton,
  useToast,
  Button,
  IconButton,
  Menu,
  MenuList,
  MenuButton,
  MenuItem,
  Input,
  InputProps,
} from "@chakra-ui/react";
import {
  AnalysisResult,
  AnalysisQuery,
  ApprovalStatus,
  UserInfo,
  QueryExpression,
  QueryOperator,
  QueryOperand,
  FilterOptions,
  AnalysisSorting,
  Workspace,
} from "sap-client";
import {
  HamburgerIcon,
  AddIcon,
  EditIcon,
  DeleteIcon,
  CheckIcon,
  MinusIcon,
  NotAllowedIcon,
  StarIcon,
} from "@chakra-ui/icons";
import DataTable, {
  ColumnReordering,
  DataTableSelection,
} from "./data-table/data-table";
import { useMutation } from "redux-query-react";
import {
  setWorkspaceFavorite,
  leaveWorkspace,
} from "../workspaces/workspaces-query-configs";

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

  const [leaveWorkspaceState, leaveWs] = useMutation((workspaceId: string) => {
    return leaveWorkspace({
      workspaceId,
    });
  });

  const [setFavoriteState, setFavorite] = useMutation(
    (workspaceId: string, isFavorite: boolean) => {
      return setWorkspaceFavorite({
        setFavorite: {
          workspaceId,
          isFavorite,
        },
      });
    }
  );
  const [searchStr, setSearchStr] = useState("");

  const displayWorkspaces = useMemo(
    () =>
      workspaces
        .filter((w) => !searchStr || w.name.includes(searchStr))
        .sort((a, b) => Number(b.isFavorite) - Number(a.isFavorite)),
    [workspaces, searchStr]
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
          style={{ width: "calc(100% - 1rem)" }}
          marginX={2}
          variant="outline"
          placeholder="Search for workspaces"
          onChange={(e) => setSearchStr(e.target.value)}
        />
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
                <Flex direction="row" style={{ flexGrow: 1 }}>
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
                    style={{ flexGrow: 1, margin: "4px" }}
                    onClick={() => {
                      setWorkspace(w);
                    }}
                  >
                    {w.name}
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
      </MenuList>
    </Menu>
  );
};
