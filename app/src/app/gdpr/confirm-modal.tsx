import React, { useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

type ConfirmModalProp = {
  title: string;
  text: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const ConfirmModal = (props: ConfirmModalProp) => {
  const { title, text, isOpen, onClose, onConfirm } = props;
  const { t } = useTranslation();
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>{text}</ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            {t("Close")}
          </Button>
          <Button colorScheme="red" onClick={onConfirm}>{t("Forget user")}</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default React.memo(ConfirmModal);
