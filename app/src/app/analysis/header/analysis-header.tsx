import React from "react";
import { Box, Heading, Flex } from "@chakra-ui/react";
import { AnalysisQuery } from "sap-client";
import AnalysisSearch from "./search/analysis-search";
import AnalysisViewSelector from "./view-selector/analysis-view-selector";

type AnalysisHeaderProps = {
  sidebarWidth?: string;
  hideSearch?: boolean;
  hideSelector?: boolean;
  onSearch?: (q: AnalysisQuery) => void;
};

function AnalysisHeader({
  sidebarWidth,
  hideSearch,
  hideSelector,
  onSearch
}: AnalysisHeaderProps) {
  return (
    <Flex align="center">
      <Box minW={sidebarWidth || "300px"} flexShrink={0}>
        <Heading>SOFI</Heading>
      </Box>
      {hideSearch || <AnalysisSearch onSubmit={onSearch} />}
      <Box minW="250px" ml="10">
        {hideSelector || <AnalysisViewSelector />}
      </Box>
    </Flex>
  );
}

export default React.memo(AnalysisHeader);
