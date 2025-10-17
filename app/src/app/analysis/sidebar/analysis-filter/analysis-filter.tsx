import React, { useEffect } from "react";
import Select, { ActionMeta, OptionTypeBase, ValueType } from "react-select";
import { AnalysisResult, QueryOperand } from "sap-client";
import { Text } from "@chakra-ui/react";
import { selectTheme } from "app/app.styles";
import { useTranslation } from "react-i18next";
import { PropFilter } from "utils";
import FilterBox from "../filter-box";
import { displayOperandName } from "app/analysis/search/search-utils";

type AnalysisFilterProps = {
  providedSpecies: string[];
  serotypeFinals: string[];
  sts: string[];
  onFilterChange: (resultingFilter: PropFilter<AnalysisResult>) => void;
  isDisabled: boolean;
  queryOperands: QueryOperand[];
  clearFieldFromSearch: (field: keyof AnalysisResult) => void;
};

function AnalysisFilter(props: AnalysisFilterProps) {
  const {
    providedSpecies,
    serotypeFinals,
    sts,
    onFilterChange,
    isDisabled,
    queryOperands,
    clearFieldFromSearch,
  } = props;

  const providedSpeciesOptions = React.useMemo(
    () => providedSpecies.filter(Boolean).map((x) => ({ value: x, label: x })),
    [providedSpecies]
  );
  const serotypeOptions = React.useMemo(
    () => serotypeFinals.filter(Boolean).map((x) => ({ value: x, label: x })),
    [serotypeFinals]
  );
  const stOptions = React.useMemo(
    () => sts.filter(Boolean).map((x) => ({ value: x, label: x })),
    [sts]
  );

  const { t } = useTranslation();
  const [state, setState] = React.useState(
    {} as { [K in keyof AnalysisResult]: ValueType<OptionTypeBase, true> }
  );

  // When a query changes, set all UI filter to match the query, this is useful when choosing a query from the user history
  useEffect(() => {
    const newState = {} as {
      [K in keyof AnalysisResult]: ValueType<OptionTypeBase, true>;
    };

    queryOperands.forEach((op) => {
      if (op.field && op.term) {
        newState[op.field] = [op.term];
      }
    });
    setState(newState);
  }, [queryOperands, setState]);

  const valueBuilder = (key: keyof AnalysisResult) =>
    state[key]?.map((i) => ({ label: i, value: i })) || [];

  const onChangeBuilder: (
    field: keyof AnalysisResult
  ) => (
    val: ValueType<OptionTypeBase, true>,
    action: ActionMeta<OptionTypeBase>
  ) => void = React.useCallback(
    (field) => {
      return (value, { action }) => {
        switch (action) {
          case "clear":
            value = [];
            break;
          default:
            break;
        }
        if (!Boolean(value) || value.length == 0) {
          clearFieldFromSearch(field);
        }

        const resolvedState = {
          ...state,
          [field]: [...(value?.values() || [])].map((x) => x.value),
        };
        setState(resolvedState);
        onFilterChange(resolvedState as any);
      };
    },
    [setState, onFilterChange, state, clearFieldFromSearch]
  );

  return (
    <FilterBox title="Analysis filter">
      <Text>{t("qc_provided_species")}</Text>
      <Select
        options={providedSpeciesOptions}
        value={valueBuilder("qc_provided_species")}
        isMulti
        theme={selectTheme}
        onChange={onChangeBuilder("qc_provided_species")}
        isDisabled={isDisabled}
      />
      <Text mt={2}>{t("serotype_final")}</Text>
      <Select
        options={serotypeOptions}
        isMulti
        value={valueBuilder("serotype_final")}
        theme={selectTheme}
        onChange={onChangeBuilder("serotype_final")}
        isDisabled={isDisabled}
      />
      <Text mt={2}>{t("st_final")}</Text>
      <Select
        options={stOptions}
        isMulti
        value={valueBuilder("st_final")}
        theme={selectTheme}
        onChange={onChangeBuilder("st_final")}
        isDisabled={isDisabled}
      />
    </FilterBox>
  );
}

export default React.memo(AnalysisFilter);
