import React from "react";
import { Box, Heading, Flex } from "@chakra-ui/react";
import { AnalysisQuery } from "sap-client";
import AnalysisSearch from "../analysis/search/analysis-search";
import AnalysisViewSelector from "../analysis/view-selector/analysis-view-selector";

type HeaderProps = {
  sidebarWidth?: string;
};

function Header({
  sidebarWidth,
}: HeaderProps) {
  return (
    <Flex align="center">
      <Box minW={sidebarWidth || "300px"} flexShrink={0}>
        <Heading>SOFI</Heading>
      </Box>
    </Flex>
  );
}

export default React.memo(Header);
