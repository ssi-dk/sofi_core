import React, { useCallback, useState } from "react";
import { Input, Spinner } from "@chakra-ui/react";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useMutation } from "redux-query-react";
import { sendToMicroreact as sendToMicroreactQuery } from "./microreact-query-configs";

type Props = {
  workspace: string;
  onClose: () => void;
};

export const SendToMicroreactModal = (props: Props) => {
  const { t } = useTranslation();
  const { workspace, onClose } = props;
  const [token, setToken] = useState<string>();
  const [isSending, setIsSending] = useState<boolean>(false);

  const [{ isPending, status }, sendToWorkspace] = useMutation(() => {
    return sendToMicroreactQuery({
      workspace: workspace,
      mr_access_token: token,
    });
  });

  const onSend = useCallback(async () => {
    setIsSending(true);
    sendToWorkspace();
  }, [setIsSending, sendToWorkspace]);

  const handleChange = (event) => setToken(event.target.value);

  return (
    <Modal isOpen={true} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent mt="0">
        <ModalHeader pl="7">{`${t("Send To Microreact")}`}</ModalHeader>
        <ModalCloseButton />
        <ModalBody px="7">
          {!isPending ? (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <div>
                Token:
                <Input
                  value={token}
                  onChange={handleChange}
                  placeholder="Token"
                />
              </div>
            </div>
          ) : (
            <>
              <Spinner size="xl" />
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            {t("Close")}
          </Button>
          <Button
            colorScheme="blue"
            mr={3}
            onClick={onSend}
            disabled={isSending || !token}
          >
            {t("Send")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
