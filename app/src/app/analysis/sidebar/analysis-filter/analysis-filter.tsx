import React from "react";
import Select, { ActionMeta, OptionTypeBase, ValueType } from "react-select";
import { AnalysisResult } from 'sap-client';
import { Text } from "@chakra-ui/react";
import { selectTheme } from "app/app.styles";
import { useTranslation } from "react-i18next";
import { PropFilter } from "utils";
import FilterBox from "../filter-box";

type AnalysisFilterProps = {
  agents: string[];
  serotypes: string[];
  resfinderVersions: string[];
  onFilterChange: (resultingFilter: PropFilter<AnalysisResult>) => void;
};

function AnalysisFilter(props: AnalysisFilterProps) {
  const { agents, serotypes, resfinderVersions, onFilterChange } = props;

  const agentOptions = React.useMemo(
    () => agents.map((x) => ({ value: x, label: x })),
    [agents]
  );
  const serotypeOptions = React.useMemo(
    () => serotypes.map((x) => ({ value: x, label: x })),
    [serotypes]
  );
  const rfvOptions = React.useMemo(
    () => resfinderVersions.map((x) => ({ value: x, label: x })),
    [resfinderVersions]
  );

  const { t } = useTranslation();
  const [state, setState] = React.useState({} as {[K in keyof AnalysisResult]: ValueType<OptionTypeBase, true>});

  const onChangeBuilder: (
    field: keyof AnalysisResult 
  ) => (
    val: ValueType<OptionTypeBase, true>,
    action: ActionMeta<OptionTypeBase>
  ) => void = React.useCallback((field) => {
    return (value, { action, removedValue }) => {
      switch (action) {
        case "clear":
          value = [];
          break;
        default: break;
      };
      const resolvedState = {...state, [field]: [...value?.values() || []].map(x => x.value)};
      setState(resolvedState);
      onFilterChange(resolvedState as any);
    };
  }, [setState, onFilterChange, state]);

  return (
    <FilterBox title="Analysis filter">
      <Text>{t("Agens")}</Text>
      <Select options={agentOptions} isMulti theme={selectTheme} onChange={onChangeBuilder("provided_species")} />
      <Text mt={2}>{t("Serotyp")}</Text>
      <Select options={serotypeOptions} isMulti theme={selectTheme} onChange={onChangeBuilder("serotype")} />
      <Text mt={2}>{t("ResfinderVersion")}</Text>
      <Select options={rfvOptions} isMulti theme={selectTheme} onChange={onChangeBuilder("resfinder_version")} />
    </FilterBox>
  );
}

export default React.memo(AnalysisFilter);
