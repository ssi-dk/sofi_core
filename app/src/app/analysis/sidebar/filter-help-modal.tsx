import React from "react";
import {
  Box,
  Button,
  Heading,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const FilterHelpModal = (props: Props) => {
  const { t } = useTranslation();
  const { isOpen, onClose } = props;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="6xl"
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent mt="0">
        <ModalHeader pl="7">{t("Filter Help")}</ModalHeader>
        <ModalCloseButton />
        <ModalBody overflowY="auto" px="7">
          <Box>
            Filters can be applied to filter out irrelevant results from the current results.
          </Box>
          <br />
          <Heading size="s">NB!</Heading>
          <Box>
            Filters only work on the currently displayed results.
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            {t("Close")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default React.memo(FilterHelpModal);
