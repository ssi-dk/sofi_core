/** @jsxRuntime classic */
/** @jsx jsx */
import React from "react";
import { css, jsx } from "@emotion/react";
import {
  Box,
  Button,
  ButtonGroup,
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
        placement="bottom-start"
        closeOnBlur={false}
      >
        <PopoverTrigger>
          <IconButton
            aria-label="edit columns"
            size="sm"
            icon={<SettingsIcon />}
          />
        </PopoverTrigger>
        <PopoverContent p={5}>
          <PopoverArrow />
          <PopoverCloseButton />
          <Form>{children}</Form>
        </PopoverContent>
      </Popover>
    </React.Fragment>
  );
};
