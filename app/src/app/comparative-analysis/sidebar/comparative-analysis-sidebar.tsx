import React from "react";
import { Box } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import IsolatesInClusterWidget from "./isolates-in-cluster-widget/isolates-in-cluster-widget";
import NodeColoringFilter from "./node-clustering-filter/node-coloring-filter";

function ComparativeAnalysisSidebar() {
  const { t } = useTranslation();
  return (
    <>
      <IsolatesInClusterWidget />
      <Box m={5} />
      <NodeColoringFilter />
    </>
  );
}

export default React.memo(ComparativeAnalysisSidebar);
