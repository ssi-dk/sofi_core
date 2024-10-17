import React, { useCallback, useEffect, useState } from "react";
import { useToast } from "@chakra-ui/react";
import { useMutation } from "redux-query-react";
import { useTranslation } from "react-i18next";
import { cloneWorkspace } from "./workspaces-query-configs";
import { IconButton } from "@chakra-ui/react";
import { CopyIcon } from "@chakra-ui/icons";

type Props = {
  id: string;
  samples: string[];
};

export function CloneWorkspace(props: Props) {
  const { t } = useTranslation();
  const toast = useToast();

  const [
    cloneWorkspaceQueryState,
    cloneWorkspaceMutation,
  ] = useMutation((name: string, id: string) => cloneWorkspace({ name, id, samples: props.samples }));

  const [needsNotify, setNeedsNotify] = useState(true);

  const cloneWorkspaceCallback = useCallback(() => {
    const name = prompt("Workspace name");
    if (name) {
      setNeedsNotify(true);
      cloneWorkspaceMutation(name, props.id);
    }
  }, [cloneWorkspaceMutation, setNeedsNotify, props.id]);

  useEffect(() => {
    if (
      needsNotify &&
      cloneWorkspaceQueryState.status >= 200 &&
      cloneWorkspaceQueryState.status < 300 &&
      !cloneWorkspaceQueryState.isPending
    ) {
      toast({
        title: t("Workspace cloned"),
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      setNeedsNotify(false);
    }
  }, [t, cloneWorkspaceQueryState, toast, needsNotify, setNeedsNotify]);

  return (
    <IconButton
      icon={<CopyIcon />}
      aria-label={`${t("Clone workspace")}`}
      onClick={cloneWorkspaceCallback}
    />
  );
}
