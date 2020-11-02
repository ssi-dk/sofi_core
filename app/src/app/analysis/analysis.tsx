import React from "react";
import AnalysisDataTable from "./data-table/analysis-data-table";
import { Box } from "@chakra-ui/core"
import AnalysisHeader from "./header/analysis-header";

export default function Analysis() {
  const sidebarWidth = 20;
  return <Box w="100%">
    <AnalysisHeader sidebarWidth={sidebarWidth}/>
    <AnalysisDataTable />
  </Box>;
}
