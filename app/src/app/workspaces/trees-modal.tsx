import React, { useState } from "react";
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

type Props = {
  workspace: string;
  onClose: () => void;
};

export const TreesModal = (props: Props) => {
  const { t } = useTranslation();
  const { workspace, onClose } = props;
  const [treeMethod, setTreeMethod] = useState<string>();

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
            onClick={() => {
              alert(`${workspace}: ${treeMethod}`);
            }}
            disabled={!treeMethod}
          >
            {t("Build tree")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
