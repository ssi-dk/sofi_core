import React from "react";
import { Box, Flex, Heading } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import HalfHolyGrailLayout from "layouts/half-holy-grail";

type Props = {
  id: string;
};

export function Workspace(props: Props) {
  const { t } = useTranslation();
  const { id } = props;

  const content = (
    <Box textOverflow="hidden" minH="100vh">
      <Flex
        padding="20px"
        alignItems="center"
        gap={6}
        justifyContent="space-between"
      >
        <Heading>{`${t("Workspace")}: ${id}`}</Heading>
      </Flex>
    </Box>
  );

  return <HalfHolyGrailLayout content={content} sidebar={null} />;
}
