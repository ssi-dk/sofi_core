import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { RootState } from "app/root-reducer";
import { useSelector } from "react-redux";
import { UserInfo, WorkspaceInfo } from "sap-client";

type Props = {
  workspace: string;
  onClose: () => void;
};

export const SendToMicroreactModal = (props: Props) => {
  const { t } = useTranslation();
  const { workspace, onClose } = props;
  const user = useSelector<RootState>((s) => s.entities.user ?? {}) as UserInfo;
  const localStorageKey = useMemo(() => {
    return `${user.userId}-microreact-token`;
  }, [user]);
  const [token, setToken] = useState<string>(
    localStorage.getItem(localStorageKey)
  );
  const [isSending, setIsSending] = useState<boolean>(false);

  const workspaceInfo = useSelector<RootState>(
    (s) => s.entities.workspace ?? {}
  ) as WorkspaceInfo;

  const [{ isPending, status }, sendToWorkspace] = useMutation(() => {
    localStorage.setItem(localStorageKey, token);
    return sendToMicroreactQuery({
      workspace: workspace,
      mr_access_token: token,
    });
  });

  useEffect(() => {
    const url = workspaceInfo.microreact?.url;
    if (url && status >= 200 && status < 300) {
      window.open(url, "_blank");
    }
  }, [workspaceInfo, status]);

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
          {!isPending && status ? (
            <div>Workspace sent to Microreact.</div>
          ) : null}
          {!isPending && !status ? (
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
          ) : null}
          {isPending ? <Spinner size="xl" /> : null}
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
