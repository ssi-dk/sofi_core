import React from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

type Props = {
  rowId: string;
  field: string;
  value: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export const CellConfirmModal = (props: Props) => {
  const { rowId, field, value, isOpen, onClose, onConfirm } = props;
  const { t } = useTranslation();

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{`${t("Confirm editing")} ${field}?`}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>{`${t(
          "Are you sure you want to change the value on sequence"
        )} ${rowId} ${t("to")} ${value}`}</ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            {t("Close")}
          </Button>
          <Button colorScheme="blue" onClick={onConfirm}>
            {t("Confirm")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
