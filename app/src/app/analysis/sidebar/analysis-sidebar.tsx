import React, { useEffect, useState } from "react";
import { Box } from "@chakra-ui/react";
import { PropFilter, RangeFilter } from "utils";
import { AnalysisResult, QueryExpression, QueryOperand } from "sap-client";
import MetaFilter from "./meta-filter/meta-filter";
import AnalysisFilter from "./analysis-filter/analysis-filter";

type AnalysisSidebarProps = {
  data: AnalysisResult[];
  onPropFilterChange: (filter: PropFilter<AnalysisResult>) => void;
  onRangeFilterChange: (filter: RangeFilter<AnalysisResult>) => void;
  isDisabled: boolean;
  queryOperands: QueryOperand[]
};

function AnalysisSidebar(props: AnalysisSidebarProps) {
  const { data, onPropFilterChange, onRangeFilterChange, isDisabled,queryOperands } = props;

  const sortUnique = React.useCallback(
    (items: string[]) => Array.from(new Set(items)).sort(),
    []
  );
  const sts = React.useMemo(
    () => sortUnique(data.map((x) => `${x.st_final}`)),
    [data, sortUnique]
  );
  const serotypes = React.useMemo(
    () => sortUnique(data.map((x) => x.serotype_final)),
    [data, sortUnique]
  );
  const animalSpecies = React.useMemo(
    () => sortUnique(data.map((x) => x.animal_species)),
    [data, sortUnique]
  );
  const organisations = React.useMemo(
    () => sortUnique(data.map((x) => x.institution)),
    [data, sortUnique]
  );
  const projects = React.useMemo(
    () => sortUnique(data.map((x) => x.project_title)),
    [data, sortUnique]
  );
  const projectNrs = React.useMemo(
    () => sortUnique(data.map((x) => x.project_number)),
    [data, sortUnique]
  );
  const providedSpecies = React.useMemo(
    () => sortUnique(data.map((x) => x.qc_provided_species)),
    [data, sortUnique]
  );
  const runIds = React.useMemo(() => sortUnique(data.map((x) => x.run_id)), [
    data,
    sortUnique,
  ]);
  const cprs = React.useMemo(() => sortUnique(data.map((x) => x.cpr_nr)), [
    data,
    sortUnique,
  ]);
  const isolateIds = React.useMemo(
    () => sortUnique(data.map((x) => x.isolate_id)),
    [data, sortUnique]
  );
  const fuds = React.useMemo(() => sortUnique(data.map((x) => x.fud_number)), [
    data,
    sortUnique,
  ]);
  const clusters = React.useMemo(
    () => sortUnique(data.map((x) => x.cluster_id)),
    [data, sortUnique]
  );

  return (
    <>
      <MetaFilter
        queryOperands={queryOperands}
        organisations={organisations}
        projects={projects}
        projectNrs={projectNrs}
        dyreart={animalSpecies}
        runIds={runIds}
        cprs={cprs}
        isolateIds={isolateIds}
        fuds={fuds}
        clusters={clusters}
        onPropFilterChange={onPropFilterChange}
        onRangeFilterChange={onRangeFilterChange}
        isDisabled={isDisabled}
      />
      <Box m={3} />
      <AnalysisFilter
        sts={sts}
        serotypeFinals={serotypes}
        providedSpecies={providedSpecies}
        onFilterChange={onPropFilterChange}
        isDisabled={isDisabled}
      />
    </>
  );
}

export default React.memo(AnalysisSidebar);
