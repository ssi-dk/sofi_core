import React from "react";
import { Box } from "@chakra-ui/react";
import { PropFilter, RangeFilter } from "utils";
import { AnalysisResult, QueryOperand, FilterOptions } from "sap-client";
import MetaFilter from "./meta-filter/meta-filter";
import AnalysisFilter from "./analysis-filter/analysis-filter";

type AnalysisSidebarProps = {
  data: AnalysisResult[];
  filterOptions: FilterOptions;
  onPropFilterChange: (filter: PropFilter<AnalysisResult>) => void;
  onRangeFilterChange: (filter: RangeFilter<AnalysisResult>) => void;
  onApprovalFilterChange: (resultingFilter: [ApprovalStatus]) => void;
  isDisabled: boolean;
  queryOperands: QueryOperand[];
  clearFieldFromSearch: (field: string) => void;
};

function AnalysisSidebar(props: AnalysisSidebarProps) {
  const {
    data,
    filterOptions,
    onPropFilterChange,
    onRangeFilterChange,
    onApprovalFilterChange,
    isDisabled,
    queryOperands,
    clearFieldFromSearch,
  } = props;

  const sortUnique = React.useCallback(
    (items: string[]) => Array.from(new Set(items)).sort(),
    []
  );

  // Keep these for AnalysisFilter - they still derive from current data
  const sts = React.useMemo(
    () => sortUnique(data.map((x) => `${x.st_final}`)),
    [data, sortUnique]
  );
  const serotypes = React.useMemo(
    () => sortUnique(data.map((x) => x.serotype_final)),
    [data, sortUnique]
  );
  const providedSpecies = React.useMemo(
    () => sortUnique(data.map((x) => x.qc_provided_species)),
    [data, sortUnique]
  );

  return (
    <>
      <MetaFilter
        clearFieldFromSearch={clearFieldFromSearch}
        queryOperands={queryOperands}
        filterOptions={filterOptions}
        onPropFilterChange={onPropFilterChange}
        onRangeFilterChange={onRangeFilterChange}
        onApprovalFilterChange={onApprovalFilterChange}
        isDisabled={isDisabled}
      />
      <Box m={3} />
      <AnalysisFilter
        clearFieldFromSearch={clearFieldFromSearch}
        queryOperands={queryOperands}
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
