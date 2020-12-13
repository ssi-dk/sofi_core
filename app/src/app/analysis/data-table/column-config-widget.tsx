/** @jsxRuntime classic */
/** @jsx jsx */
import React from "react";
import { jsx } from "@emotion/react";
import {
  Box,
  Divider,
  Heading,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Stack,
  useDisclosure,
} from "@chakra-ui/react";
import { SettingsIcon } from "@chakra-ui/icons";

const Form: React.FC = ({ children }) => {
  return <Stack spacing={4}>{children}</Stack>;
};

export const ColumnConfigWidget: React.FC = ({ children }) => {
  const { onOpen, onClose, isOpen } = useDisclosure();

  return (
    <React.Fragment>
      <Popover
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onClose}
        placement="left"
        closeOnBlur={false}
      >
        <PopoverTrigger>
          <IconButton
            aria-label="edit columns"
            size="sm"
            icon={<SettingsIcon />}
          />
        </PopoverTrigger>
        {isOpen && (
          <PopoverContent p={5}>
            <PopoverArrow />
            <PopoverCloseButton />
            <Heading size="sm">Visible columns</Heading>
            <Divider />
            <Box maxHeight="90vh" overflowY="auto">
              <Form>{children}</Form>
            </Box>
          </PopoverContent>
        )}
      </Popover>
    </React.Fragment>
  );
};
