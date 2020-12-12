import React from "react";
import { Box, Heading, Flex } from "@chakra-ui/react";
import AnalysisSearch from "./search/analysis-search";
import AnalysisViewSelector from "./view-selector/analysis-view-selector";

type AnalysisHeaderProps = {
  sidebarWidth?: string;
  hideSearch?: boolean;
  hideSelector?: boolean;
};

function AnalysisHeader({
  sidebarWidth,
  hideSearch,
  hideSelector,
}: AnalysisHeaderProps) {
  return (
    <Flex align="center">
      <Box minW={sidebarWidth || "300px"} flexShrink={0}>
        <Heading>SAP</Heading>
      </Box>
      {hideSearch || <AnalysisSearch />}
      <Box minW="250px" ml="10">
        {hideSelector || <AnalysisViewSelector />}
      </Box>
    </Flex>
  );
}

export default React.memo(AnalysisHeader);