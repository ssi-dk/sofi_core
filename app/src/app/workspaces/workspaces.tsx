import React, { useState } from "react";
import {
  Box,
  Flex,
  Text,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useToast,
} from "@chakra-ui/react";
import { useMutation, useRequest } from "redux-query-react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { RootState } from "app/root-reducer";
import HalfHolyGrailLayout from "layouts/half-holy-grail";
import { fetchWorkspaces, deleteWorkspace } from "./workspaces-query-configs";
import type { Workspace } from "sap-client";
import { DeleteIcon } from "@chakra-ui/icons";

export function Workspaces() {
  const [workspacesQueryState] = useRequest(fetchWorkspaces());

  const workspaces = useSelector<RootState>((s) =>
    Object.values(s.entities.workspaces ?? {})
  ) as Array<Workspace>;

  const { t } = useTranslation();
  const toast = useToast();

  const [
    deleteWorkspaceQueryState,
    deleteWorkspaceMutation,
  ] = useMutation((id: string) => deleteWorkspace({ workspaceId: id }));

  const [needsNotify, setNeedsNotify] = useState(true);

  const deleteWorkspaceCallback = React.useCallback(
    (id: string) => {
      setNeedsNotify(true);
      deleteWorkspaceMutation(id);
    },
    [deleteWorkspaceMutation, setNeedsNotify]
  );

  React.useMemo(() => {
    if (
      needsNotify &&
      deleteWorkspaceQueryState.status >= 200 &&
      deleteWorkspaceQueryState.status < 300 &&
      !deleteWorkspaceQueryState.isPending
    ) {
      toast({
        title: t("Workspace deleted"),
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      setNeedsNotify(false);
    }
  }, [t, deleteWorkspaceQueryState, toast, needsNotify, setNeedsNotify]);

  const content = (
    <Box textOverflow="hidden" minH="100vh">
      <Flex
        padding="20px"
        alignItems="center"
        gap={6}
        justifyContent="space-between"
      >
        <Heading>{`${t("My workspaces")}`}</Heading>
      </Flex>
      <Table variant="striped">
        <Thead>
          <Tr>
            <Th>{t("Name")}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {workspaces &&
            workspaces.map((h) => {
              return (
                <Tr verticalAlign="top" key={h.id}>
                  <Td>
                    <Text>{h.name}</Text>
                  </Td>
                  <Td>
                    <IconButton
                      icon={<DeleteIcon />}
                      aria-label={`${t("Delete")}`}
                      onClick={() => deleteWorkspaceCallback(h.id)}
                    />
                  </Td>
                </Tr>
              );
            })}
        </Tbody>
      </Table>
      {workspacesQueryState.isPending && `${t("Fetching...")}`}
      {workspacesQueryState.isFinished &&
        `${t("Found")} ${workspaces.length} ${t("workspaces")}.`}
    </Box>
  );

  return <HalfHolyGrailLayout content={content} sidebar={null} />;
}
