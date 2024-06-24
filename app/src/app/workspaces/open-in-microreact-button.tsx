import { Button } from "@chakra-ui/react";
import React, { useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "app/root-reducer";
import { WorkspaceInfo } from "sap-client";

export const OpenInMicroreactButton = () => {
  const workspaceInfo = useSelector<RootState>(
    (s) => s.entities.workspace ?? {}
  ) as WorkspaceInfo;

  const onOpen = useCallback(() => {
    window.open(workspaceInfo.microreact?.url, "_blank");
  }, [workspaceInfo]);

  if (!workspaceInfo.microreact?.url) {
    return null;
  }

  return <Button onClick={onOpen}>Open in Microreact</Button>;
};
