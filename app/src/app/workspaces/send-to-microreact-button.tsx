import { Button, useDisclosure } from "@chakra-ui/react";
import { SendToMicroreactModal } from "./send-to-microreact-modal";
import React from "react";

type Props = {
  workspace: string;
};

export const SendToMicroreactButton = ({ workspace }: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      {isOpen ? (
        <SendToMicroreactModal workspace={workspace} onClose={onClose} />
      ) : null}

      <Button marginLeft={2} onClick={onOpen}>
        Send workspace to Microreact
      </Button>
    </>
  );
};
