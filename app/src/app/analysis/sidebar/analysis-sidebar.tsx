import React from "react";
import { Box } from "@chakra-ui/react";
import { PropFilter, RangeFilter } from "utils";
import { AnalysisResult, QueryOperand, FilterOptions } from "sap-client";
import MetaFilter from "./meta-filter/meta-filter";
import AnalysisFilter from "./analysis-filter/analysis-filter";

type AnalysisSidebarProps = {
  filterOptions: FilterOptions;
  onPropFilterChange: (filter: PropFilter<AnalysisResult>) => void;
  onRangeFilterChange: (filter: RangeFilter<AnalysisResult>) => void;
  onApprovalFilterChange: (resultingFilter: ApprovalStatus[]) => void;
  isDisabled: boolean;
  queryOperands: QueryOperand[];
  clearFieldFromSearch: (field: string) => void;
};

function AnalysisSidebar(props: AnalysisSidebarProps) {
  const {
    filterOptions,
    onPropFilterChange,
    onRangeFilterChange,
    onApprovalFilterChange,
    isDisabled,
    queryOperands,
    clearFieldFromSearch,
  } = props;

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
        sts={filterOptions.st_finals}
        serotypeFinals={filterOptions.serotype_finals}
        providedSpecies={filterOptions.qc_provided_species}
        onFilterChange={onPropFilterChange}
        isDisabled={isDisabled}
      />
    </>
  );
}

export default React.memo(AnalysisSidebar);
