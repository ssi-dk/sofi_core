import React from "react";
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
} from "@chakra-ui/react";
import { useRequest } from "redux-query-react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { RootState } from "app/root-reducer";
import HalfHolyGrailLayout from "layouts/half-holy-grail";
import { fetchWorkspaces } from "./workspaces-query-configs";
import { Workspace } from "sap-client";

export function Workspaces() {
  const [workspacesQueryState] = useRequest(fetchWorkspaces());

  const workspaces = useSelector<RootState>((s) =>
    Object.values(s.entities.workspaces ?? {})
  ) as Array<Workspace>;

  const { t } = useTranslation();

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
