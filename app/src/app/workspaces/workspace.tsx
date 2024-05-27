import React from "react";
import { Box, Flex, Heading, Spinner } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import HalfHolyGrailLayout from "layouts/half-holy-grail";
import { useRequest } from "redux-query-react";
import { getWorkspace } from "./workspaces-query-configs";
import { useSelector } from "react-redux";
import { RootState } from "app/root-reducer";
import { WorkspaceInfo } from "sap-client";

type Props = {
  id: string;
};

export function Workspace(props: Props) {
  const { t } = useTranslation();
  const { id } = props;

  const [workspaceQueryState] = useRequest(getWorkspace(id));

  const workspace = useSelector<RootState>(
    (s) => s.entities.workspace ?? {}
  ) as WorkspaceInfo;

  let content = <Spinner size="xl" />;

  if (workspaceQueryState.isFinished) {
    content = (
      <Box textOverflow="hidden" minH="100vh">
        <Flex
          padding="20px"
          alignItems="center"
          gap={6}
          justifyContent="space-between"
        >
          <Heading>{`${workspace?.name}`}</Heading>
        </Flex>
      </Box>
    );
  }
  return <HalfHolyGrailLayout content={content} sidebar={null} />;
}
