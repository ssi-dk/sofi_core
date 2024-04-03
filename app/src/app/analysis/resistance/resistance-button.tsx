import React, { useCallback } from "react";
import {
  IconButton,
  useToast,
} from "@chakra-ui/react";
import { AnalysisResult } from "sap-client";
import { DataTableSelection } from "../data-table/data-table";
import { Bacteria } from "app/icons/bacteria";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { ResistanceTable } from "./resistance-table";

type Props = {
  selection: DataTableSelection<AnalysisResult>;
};

export const ResistanceButton = (props: Props) => {
  const { t } = useTranslation();
  const toast = useToast();
  const { selection } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();

  const onClickCallback = useCallback(() => {
    const sequenceIds = Object.keys(selection);
    if (sequenceIds.length === 0) {
      toast({
        title: "No sequences selected",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });

      return;
    }
    onOpen();
  }, [selection, onOpen, toast]);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalOverlay />
        <ModalContent mt="0">
          <ModalHeader pl="7">{`${t("Resistance")}`}</ModalHeader>
          <ModalCloseButton />
          <ModalBody overflowY="auto" px="7">
            <ResistanceTable selection={selection} />
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              {t("Close")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <IconButton
        aria-label="Resistance"
        title="Resistance"
        icon={
          <div style={{ margin: "6px", width: "100%" }}>
            <Bacteria />
          </div>
        }
        size="sm"
        ml="1"
        onClick={onClickCallback}
      />
    </>
  );
};
