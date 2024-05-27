import React from "react";
import { MenuItem } from "@chakra-ui/react";
import { AnalysisResult } from "sap-client";
import { useDisclosure } from "@chakra-ui/react";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import { DataTableSelection } from "../analysis/data-table/data-table";
import { SendToWorkspaceModal } from "./send-to-workspace-modal";

type Props = {
  selection: DataTableSelection<AnalysisResult>;
};

export const SendToWorkspaceMenuItem = (props: Props) => {
  const { selection } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      {isOpen ? (
        <SendToWorkspaceModal selection={selection} onClose={onClose} />
      ) : null}
      <MenuItem
        aria-label="Send to Workspace"
        title="Send to Workspace"
        icon={<ArrowForwardIcon />}
        onClick={onOpen}
      >
        Send to Workspace
      </MenuItem>
    </>
  );
};
