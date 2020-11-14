import React from "react";
import { Box } from "@chakra-ui/react";
import MetaFilter from "./meta-filter/meta-filter";
import AnalysisFilter from "./analysis-filter/analysis-filter";

export default function AnalysisSidebar() {
  return (
    <>
      <MetaFilter />
      <Box m={3} />
      <AnalysisFilter />
    </>
  );
}
