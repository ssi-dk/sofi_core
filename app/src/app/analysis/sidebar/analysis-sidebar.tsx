import React from "react";
import { Stack, Box } from "@chakra-ui/core";
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
