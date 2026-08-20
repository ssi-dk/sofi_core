import React, { useState } from "react";
import { IconButton, useToast } from "@chakra-ui/react";
import { useMutation } from "redux-query-react";
import { useTranslation } from "react-i18next";
import { leaveWorkspace } from "./workspaces-query-configs";
import { DeleteIcon } from "@chakra-ui/icons";

type Props = {
  id: string;
};

export function DeleteWorkspace(props: Props) {
  const { t } = useTranslation();
  const toast = useToast();
  const { id: workspaceId } = props;

  const [
    deleteWorkspaceQueryState,
    deleteWorkspaceMutation,
  ] = useMutation((id: string) => leaveWorkspace({ workspaceId: id }));

  const [needsNotify, setNeedsNotify] = useState(true);

  const deleteWorkspaceCallback = React.useCallback(
    (id: string) => {
      const ok = confirm(
        "Are you sure you want to delete the currently selected workspace?"
      );
      if (ok) {
        setNeedsNotify(true);
        deleteWorkspaceMutation(id);
      }
    },
    [deleteWorkspaceMutation, setNeedsNotify]
  );

  React.useMemo(() => {
    if (
      needsNotify &&
      deleteWorkspaceQueryState.status >= 200 &&
      deleteWorkspaceQueryState.status < 300 &&
      !deleteWorkspaceQueryState.isPending
    ) {
      toast({
        title: t("Workspace deleted"),
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      setNeedsNotify(false);
    }
  }, [t, deleteWorkspaceQueryState, toast, needsNotify, setNeedsNotify]);

  return (
    <IconButton
      icon={<DeleteIcon />}
      aria-label={`${t("Delete")}`}
      onClick={() => deleteWorkspaceCallback(workspaceId)}
    />
  );
}
