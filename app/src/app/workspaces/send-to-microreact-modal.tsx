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
  Tooltip,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useMutation } from "redux-query-react";
import {
  sendToMicroreact as sendToMicroreactQuery,
  getMicroreactUrl,
} from "./microreact-query-configs";
import { RootState } from "app/root-reducer";
import { useSelector } from "react-redux";
import { useRequest } from "redux-query-react";
import { TreeMethod, UserInfo, WorkspaceInfo } from "sap-client";
import { TreeMethodCheckboxGroup } from "./tree-method-checkbox-group";

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
    localStorage.getItem(localStorageKey) ?? ""
  );
  const [isSending, setIsSending] = useState<boolean>(false);
  const [treeMethods, setTreeMethods] = useState<Array<string>>([
    TreeMethod.single,
  ]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const workspaceInfo = useSelector<RootState>(
    (s) => s.entities.workspace ?? {}
  ) as WorkspaceInfo;

  const [{ isPending, status }, sendToWorkspace] = useMutation(() => {
    localStorage.setItem(localStorageKey, token);
    return sendToMicroreactQuery({
      workspace: workspace,
      mr_access_token: token,
      tree_methods: treeMethods.map((tm) => TreeMethod[tm]),
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
    const result = await sendToWorkspace();

    if (result.status >= 400) {
      const errorMsg = result?.body?.message?.details ?? "An unknown error occurred";
      setErrorMessage(errorMsg);
    } else {
      setErrorMessage(null);
    }
    setIsSending(false);
  }, [sendToWorkspace]);

  useRequest(getMicroreactUrl());

  const microreactBaseUrl = useSelector<RootState>(
    (s) => s.entities.url ?? ""
  ) as string;

  const onGotoMicroreact = useCallback(() => {
    window.open(
      microreactBaseUrl + "/api/auth/signin?callbackUrl=/my-account/settings",
      "_blank"
    );
  }, [microreactBaseUrl]);

  const handleChange = (event) => setToken(event.target.value);

  return (
    <Modal isOpen={true} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent mt="0">
        <ModalHeader pl="7">{`${t("Send To Microreact")}`}</ModalHeader>
        <ModalCloseButton />
        <ModalBody px="7">
          {!isPending && status >= 200 && status < 300 ? (
            <div>Workspace sent to Microreact.</div>
          ) : null}
          {!isPending && (status < 200 || status >= 300) ? (
            <div>Failed to send workspace to Microreact.</div>
          ) : null}
          {!isPending && status >= 400 && errorMessage ? (
            <div>{errorMessage}</div>
          ) : null}
          {!isPending && !status ? (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <Tooltip
                hasArrow
                label="See your API Access Token and other settings"
                bg="rgb(191, 26, 47)"
              >
                <Button
                  w={"fit-content"}
                  ml={"auto"}
                  mr={0}
                  colorScheme="blue"
                  onClick={onGotoMicroreact}
                >
                  Microreact Account Settings
                </Button>
              </Tooltip>
              <div>
                {t("Token")}:
                <Input
                  value={token}
                  onChange={handleChange}
                  placeholder={t("Token")}
                />
              </div>
              <div>
                {t("Tree methods")}:
                <TreeMethodCheckboxGroup
                  value={treeMethods}
                  onChange={setTreeMethods}
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
            disabled={
              isSending || !token || !treeMethods || treeMethods.length === 0
            }
          >
            {t("Send")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
