import { Button, useDisclosure } from "@chakra-ui/react";
import { TreesModal } from "./trees-modal";
import React from "react";

type Props = {
  workspace: string;
};

export const TreesButton = (props: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      {isOpen ? (
        <TreesModal workspace={props.workspace} onClose={onClose} />
      ) : null}

      <Button onClick={onOpen}>Generate Tree</Button>
    </>
  );
};
