import React from "react";
import { Box } from "@chakra-ui/react";
import { PropFilter } from "utils";
import { AnalysisResult } from 'sap-client';
import MetaFilter from "./meta-filter/meta-filter";
import AnalysisFilter from "./analysis-filter/analysis-filter";

export type AnalysisSidebarProps = {
  data: AnalysisResult[];
  onPropFilterChange: (filter: PropFilter<AnalysisResult>) => void;
};

function AnalysisSidebar(props: AnalysisSidebarProps) {
  const { data, onPropFilterChange } = props;

  const sortUnique = React.useCallback(
    (items: string[]) => Array.from(new Set(items)).sort(),
    []
  );

  const agents = React.useMemo(() => sortUnique(data.map((x) => x.provided_species)), [
    data,
    sortUnique,
  ]);
  const serotypes = React.useMemo(
    () => sortUnique(data.map((x) => x.serotype)),
    [data, sortUnique]
  );
  const rfv = React.useMemo(
    () => sortUnique(data.map((x) => x.resfinder_version)),
    [data, sortUnique]
  );

  return (
    <>
      <MetaFilter />
      <Box m={3} />
      <AnalysisFilter
        agents={agents}
        serotypes={serotypes}
        resfinderVersions={rfv}
        onFilterChange={onPropFilterChange}
      />
    </>
  );
}

export default React.memo(AnalysisSidebar);
