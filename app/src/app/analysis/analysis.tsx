import React from "react";
import { Box, Flex } from "@chakra-ui/react";
import AnalysisDataTable from "./data-table/analysis-data-table";
import AnalysisHeader from "./header/analysis-header";
import AnalysisSidebar from "./sidebar/analysis-sidebar";

export default function Analysis() {
  const sidebarWidth = "300px";
  return (
    <Box w="100%">
      <AnalysisHeader sidebarWidth={sidebarWidth} />
      <Flex mt={5}>
        <Box minW={sidebarWidth} pr={5}>
          <AnalysisSidebar />
        </Box>
        <Box borderWidth="1px" rounded="md">
          <AnalysisDataTable />
        </Box>
      </Flex>
    </Box>
  );
}
