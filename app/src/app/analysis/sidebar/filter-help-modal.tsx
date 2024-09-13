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

type FilterHelpModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const FilterHelpModal = (props: FilterHelpModalProps) => {
  const { t } = useTranslation();
  const { isOpen, onClose } = props;

  return (
    <React.Fragment>
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
            <div>
              <Box>
                Filters can be applied to filter out irrelevant results from the current results.
              </Box>
              <br/>
              <Heading size="s">OBS</Heading>
              <Box>
                Filters only work on the currently displayed results.
              </Box>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              {t("Close")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </React.Fragment>
  );
};

export default React.memo(FilterHelpModal);
