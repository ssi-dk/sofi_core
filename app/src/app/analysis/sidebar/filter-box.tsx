import React from "react";
import { Box, Heading, useDisclosure } from "@chakra-ui/react";
import { QuestionIcon } from "@chakra-ui/icons";
import FilterHelpModal from "./filter-help-modal";

type Props = {
  title: string;
  children: JSX.Element | JSX.Element[];
};

function FilterBox({ title, children }: Props) {
  const {
    isOpen: isFilterHelpModalOpen,
    onOpen: onFilterHelpModalOpen,
    onClose: onFilterHelpModalClose,
  } = useDisclosure();
  return (
    <Box borderWidth="1px" rounded="md" minH={200} p={2}>
      <Heading as="h5" size="sm" mb={3}>
        <div style={{ display: "flex" }}>
          <div>{title}</div>
          <div style={{ marginLeft: "auto" }}>
            <FilterHelpModal
              isOpen={isFilterHelpModalOpen}
              onClose={onFilterHelpModalClose}
            />
            <QuestionIcon
              color="gray.400"
              onClick={onFilterHelpModalOpen}
              cursor="pointer"
            />
          </div>
        </div>
      </Heading>
      {children}
    </Box>
  );
}

export default React.memo(FilterBox);
