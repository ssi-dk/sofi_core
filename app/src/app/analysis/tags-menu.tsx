import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
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
  fetchWorkspaceTags,
  setWorkspaceTag,
} from "../workspaces/workspaces-query-configs";
import { useMutation, useRequest } from "redux-query-react";
import { RootState } from "app/root-reducer";
import { HamburgerIcon, AddIcon } from "@chakra-ui/icons";

import { WsTag } from "./ws-tag";

export type TagsMenuProps = {
  workspace: Workspace;
};

export const TagsMenu = (props: TagsMenuProps) => {
  const { workspace } = props;

  const [tagsQueryState, refetchTags] = useRequest(fetchWorkspaceTags());
  const [setTagState, setTag] = useMutation(
    (tag: string, addOrRemove: boolean) => {
      return setWorkspaceTag({
        setWsTag: {
          workspaceId: workspace.id,
          tag,
          addOrRemove,
        },
      });
    }
  );
  useEffect(() => {
    if (setTagState.isFinished) {
      refetchTags();
    }
  }, [setTagState]);

  const allTags = useSelector<RootState>((s) =>
    Object.values(s.entities.tags ?? [])
  ) as Array<string>;

  const [searchStr, setSearchStr] = useState("");

  const displayTags = [...allTags]
    .filter(
      (tag) => !searchStr || tag.toLowerCase().includes(searchStr.toLowerCase())
    )
    .sort(
      (a, b) =>
        Number(workspace.tags.includes(b)) - Number(workspace.tags.includes(a))
    );

  return (
    <Menu>
      <MenuButton
        style={{ minWidth: "4rem" }}
        marginLeft={2}
        paddingX={2}
        as={Button}
        leftIcon={<HamburgerIcon />}
      >
        Tags
      </MenuButton>
      <MenuList style={{ maxHeight: "30rem", overflowY: "scroll" }}>
        <Input
          style={{ width: "calc(100% - 1rem)" }}
          marginX={2}
          variant="outline"
          placeholder="Search for, or create tags"
          onChange={(e) => setSearchStr(e.target.value)}
        />
        {displayTags.map((tag) => (
          <Flex key={tag} direction="row" style={{ margin: "0.3rem" }}>
            <input
              disabled={setTagState.isPending}
              type="checkbox"
              checked={workspace.tags.includes(tag)}
              onChange={() => {
                setTag(tag, !workspace.tags.includes(tag));
              }}
            />
            <WsTag tag={tag} />
          </Flex>
        ))}
        {searchStr && (
          <div
            style={{
              width: "calc(100% - 1rem)",
              margin: "0.5rem",
              marginBottom: 0,
            }}
          >
            <Button
              onClick={() => setTag(searchStr.trim(), true)}
              disabled={
                allTags.includes(searchStr.trim()) || setTagState.isPending
              }
            >
              Create "{searchStr}" tag
            </Button>
          </div>
        )}
      </MenuList>
    </Menu>
  );
};
