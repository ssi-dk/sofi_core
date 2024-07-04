import React, { useCallback, useEffect, useState } from "react";
import { Spinner, useToast } from "@chakra-ui/react";
import { AnalysisResult, Workspace } from "sap-client";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { DataTableSelection } from "app/analysis/data-table/data-table";
import { WorkspaceSelect } from "./workspace-select";
import { useMutation } from "redux-query-react";
import { useHistory } from "react-router";
import { createWorkspace, updateWorkspace } from "./workspaces-query-configs";
import { useSelector } from "react-redux";
import { RootState } from "app/root-reducer";

type Props = {
  selection: DataTableSelection<AnalysisResult>;
  onClose: () => void;
};

export const SendToWorkspaceModal = (props: Props) => {
  const { t } = useTranslation();
  const { selection, onClose } = props;
  const [isSending, setIsSending] = useState<boolean>(false);
  const [workspace, setWorkspace] = React.useState<string>();
  const history = useHistory();
  const toast = useToast();
  const workspaces = useSelector<RootState>((s) =>
    Object.values(s.entities.workspaces ?? {})
  ) as Array<Workspace>;

  const [{ isPending, status }, sendToWorkspace] = useMutation(
    (name: string) => {
      const samples = Object.values(selection).map((s) => s.original.id);
      if (workspace === "-- New workspace") {
        setWorkspace(name);
        return createWorkspace({
          name,
          samples,
        });
      }
      return updateWorkspace({
        workspaceId: workspace,
        updateWorkspace: { samples },
      });
    }
  );

  const onSend = useCallback(async () => {
    if (workspace === "-- New workspace") {
      const name = prompt(t("Workspace name"));
      if (name) {
        const exists = workspaces.find((w) => w.name === name);
        if (exists) {
          alert(t("Workspace already exists."));
          return;
        }
        setIsSending(true);
        sendToWorkspace(name);
      }
      return;
    }
    setIsSending(true);
    sendToWorkspace(workspace);
  }, [setIsSending, sendToWorkspace, workspaces, workspace, t]);

  const onWorkspaceChange = useCallback((id: string) => {
    setWorkspace(id);
  }, []);

  useEffect(() => {
    if (isSending && !isPending) {
      if (status >= 200 && status < 300) {
        history.push(`/workspaces/${workspace}`);
      } else {
        toast({
          title: `Error`,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
      onClose();
    }
  }, [
    isSending,
    isPending,
    status,
    onClose,
    selection,
    toast,
    history,
    workspace,
  ]);

  return (
    <Modal isOpen={true} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent mt="0">
        <ModalHeader pl="7">{`${t("Send To Workspace")}`}</ModalHeader>
        <ModalCloseButton />
        <ModalBody px="7">
          {!isSending ? (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <div>
                Workspace:
                <WorkspaceSelect onChange={onWorkspaceChange} />
              </div>
            </div>
          ) : (
            <>
              <Spinner size="xl" />
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            {t("Close")}
          </Button>
          <Button
            colorScheme="blue"
            mr={3}
            onClick={onSend}
            disabled={isSending || !workspace}
          >
            {t("Send")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
