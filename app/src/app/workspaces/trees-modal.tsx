import React, { useCallback, useState } from "react";
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
import { TreeMethodSelect } from "./tree-method-select";
import { useMutation } from "redux-query-react";
import { buildWorkspaceTree as buildWorkspaceTreeQuery } from "./workspaces-query-configs";
import { TreeMethod } from "sap-client";

type Props = {
  workspace: string;
  onClose: () => void;
};

export const TreesModal = (props: Props) => {
  const { t } = useTranslation();
  const { workspace, onClose } = props;
  const [treeMethod, setTreeMethod] = useState<string>();
  const [isSending, setIsSending] = useState<boolean>(false);

  const [, buildWorkspaceTree] = useMutation(() => {
    return buildWorkspaceTreeQuery({
      workspaceId: workspace,
      buildWorkspaceTreeRequestBody: {
        tree_method: TreeMethod[treeMethod],
      },
    });
  });

  const onBuild = useCallback(async () => {
    setIsSending(true);
    buildWorkspaceTree();
  }, [setIsSending, buildWorkspaceTree]);

  return (
    <Modal isOpen={true} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent mt="0">
        <ModalHeader pl="7">{`${t("Trees")}`}</ModalHeader>
        <ModalCloseButton />
        <ModalBody px="7">
          <div>
            {t("Tree method")}:
            <TreeMethodSelect onChange={setTreeMethod} />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            {t("Close")}
          </Button>
          <Button
            colorScheme="blue"
            mr={3}
            onClick={onBuild}
            disabled={isSending || !treeMethod}
          >
            {t("Build tree")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
