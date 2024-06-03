import React, { useCallback, useEffect, useState } from "react";
import { Button, useToast } from "@chakra-ui/react";
import { useMutation } from "redux-query-react";
import { useTranslation } from "react-i18next";
import { createWorkspace } from "./workspaces-query-configs";
import { AddIcon } from "@chakra-ui/icons";

export function CreateWorkspace() {
  const { t } = useTranslation();
  const toast = useToast();

  const [
    createWorkspaceQueryState,
    createWorkspaceMutation,
  ] = useMutation((name: string) => createWorkspace({ name }));

  const [needsNotify, setNeedsNotify] = useState(true);

  const createWorkspaceCallback = useCallback(() => {
    const name = prompt("Workspace name");
    if (name) {
      setNeedsNotify(true);
      createWorkspaceMutation(name);
    }
  }, [createWorkspaceMutation, setNeedsNotify]);

  useEffect(() => {
    if (
      needsNotify &&
      createWorkspaceQueryState.status >= 200 &&
      createWorkspaceQueryState.status < 300 &&
      !createWorkspaceQueryState.isPending
    ) {
      toast({
        title: t("Workspace created"),
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      setNeedsNotify(false);
    }
  }, [t, createWorkspaceQueryState, toast, needsNotify, setNeedsNotify]);

  return (
    <div>
      <Button leftIcon={<AddIcon />} onClick={() => createWorkspaceCallback()}>
        {t("Create workspace")}
      </Button>
    </div>
  );
}
