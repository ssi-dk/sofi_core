import React, { useState } from "react";
import { Text, Button, SimpleGrid } from "@chakra-ui/react";
import Select, { ActionMeta, OptionTypeBase, ValueType } from "react-select";
import { selectTheme } from "app/app.styles";
import DatePicker from "react-datepicker";

import { useTranslation } from "react-i18next";
import { AnalysisResult } from 'sap-client';
import { PropFilter } from 'utils';
import FilterBox from "../filter-box";
import "react-datepicker/dist/react-datepicker.css";

type MetaFilterProps = {
  organisations: string[];
  projects: string[];
  species: string[];
  onFilterChange: (resultingFilter: PropFilter<AnalysisResult>) => void;
};

function MetaFilter(props: MetaFilterProps) {
  const { organisations, projects, species, onFilterChange } = props;

  const { t } = useTranslation();
  const ExampleCustomInput = ({ value, onClick }) => (
    <Button
      onClick={onClick}
      variant="outline"
      pl={4}
      pr={8}
      backgroundColor="#fff"
      fontWeight={500}
    >
      {value}
    </Button>
  );
  const [startDate, setStartDate] = useState(new Date());

  const organisationOptions = React.useMemo(
    () => organisations.map((x) => ({ value: x, label: x })),
    [organisations]
  );
  const projectOptions = React.useMemo(
    () => projects.map((x) => ({ value: x, label: x })),
    [projects]
  );
  const speciesOptions = React.useMemo(
    () => species.map((x) => ({ value: x, label: x })),
    [species]
  );

  const [propFilterState, setPropFilterState] = React.useState({} as {[K in keyof AnalysisResult]: ValueType<OptionTypeBase, true>});

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
      const resolvedState = {...propFilterState, [field]: [...value?.values() || []].map(x => x.value)};
      setPropFilterState(resolvedState);
      onFilterChange(resolvedState as any);
    };
  }, [setPropFilterState, onFilterChange, propFilterState]);

  return (
    <FilterBox title="Metadata filter">
      <Text>{t("sampling_date")}</Text>
      <SimpleGrid columns={2}>
        <DatePicker
          selected={startDate}
          isClearable
          onChange={(c) => setStartDate(c as Date)}
          placeholderText="-"
          customInput={<ExampleCustomInput value="" onClick={() => {}} />}
        />
        <DatePicker
          selected={startDate}
          isClearable
          onChange={(c) => setStartDate(c as Date)}
          placeholderText="-"
          customInput={<ExampleCustomInput value="" onClick={() => {}} />}
        />
      </SimpleGrid>
      <Text mt={2}>{t("Organisation")}</Text>
      <Select options={organisationOptions} isMulti theme={selectTheme} onChange={onChangeBuilder("institution")} />
      <Text mt={2}>{t("Projekt")}</Text>
      <Select options={projectOptions} isMulti theme={selectTheme} onChange={onChangeBuilder("project_title")} />
      <Text mt={2}>{t("Modtagedato")}</Text>
      <SimpleGrid columns={2}>
        <DatePicker
          selected={startDate}
          isClearable
          onChange={(c) => setStartDate(c as Date)}
          placeholderText="-"
          customInput={<ExampleCustomInput value="" onClick={() => {}} />}
        />
        <DatePicker
          selected={startDate}
          isClearable
          onChange={(c) => setStartDate(c as Date)}
          placeholderText="-"
          customInput={<ExampleCustomInput value="" onClick={() => {}} />}
        />
      </SimpleGrid>
      <Text mt={2}>{t("Dyreart")}</Text>
      <Select options={speciesOptions} isMulti theme={selectTheme} onChange={onChangeBuilder("provided_species")} />
    </FilterBox>
  );
}

export default React.memo(MetaFilter);