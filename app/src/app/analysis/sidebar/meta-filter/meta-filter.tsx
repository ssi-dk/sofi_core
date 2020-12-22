/* eslint-disable react/prefer-stateless-function */
import React, { useState } from "react";
import { Text, Flex } from "@chakra-ui/react";
import Select, { ActionMeta, OptionTypeBase, ValueType } from "react-select";
import { selectTheme } from "app/app.styles";
import { useTranslation } from "react-i18next";
import { AnalysisResult } from "sap-client";
import { PropFilter, RangeFilter } from "utils";
import FilterBox from "../filter-box";
import DatePicker from "./date-picker";

type MetaFilterProps = {
  organisations: string[];
  projects: string[];
  species: string[];
  onPropFilterChange: (resultingFilter: PropFilter<AnalysisResult>) => void;
  onRangeFilterChange: (resultingFilter: RangeFilter<AnalysisResult>) => void;
};

function MetaFilter(props: MetaFilterProps) {
  const {
    organisations,
    projects,
    species,
    onPropFilterChange,
    onRangeFilterChange,
  } = props;

  const { t } = useTranslation();

  const [receivedStartDate, setReceivedStartDate] = useState(null as Date);
  const [receivedEndDate, setReceivedEndDate] = useState(null as Date);
  const [sampledStartDate, setSampledStartDate] = useState(null as Date);
  const [sampledEndDate, setSampledEndDate] = useState(null as Date);

  const [propFilterState, setPropFilterState] = React.useState(
    {} as { [K in keyof AnalysisResult]: ValueType<OptionTypeBase, true> }
  );
  const [rangeFilterState, setRangeFilterState] = React.useState(
    {} as {
      [K in keyof AnalysisResult]: {
        min: AnalysisResult[K];
        max: AnalysisResult[K];
      };
    }
  );

  // eslint-disable-next-line
  type RangeEnd = keyof RangeFilter<any>[0];

  const onDateChange = React.useCallback(
    (
      field: keyof AnalysisResult,
      end: RangeEnd,
      cb: React.Dispatch<React.SetStateAction<Date>>
    ) => (d: Date) => {
      cb(d);
      const opposite = end === "min" ? "max" : "min";
      const minDate = new Date(0);
      const maxDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000); // tomorrow
      const oppositeValue =
        opposite === "min"
          ? rangeFilterState[field]?.min ?? minDate
          : rangeFilterState[field]?.max ?? maxDate;
      const val = d !== null ? d : end === "min" ? minDate : maxDate;
      const resolvedState = {
        ...rangeFilterState,
        [field]: { [end]: val, [opposite]: oppositeValue },
      };
      setRangeFilterState(resolvedState);
      onRangeFilterChange(resolvedState);
    },
    [rangeFilterState, setRangeFilterState, onRangeFilterChange]
  );

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
        const resolvedState = {
          ...propFilterState,
          [field]: [...(value?.values() || [])].map((x) => x.value),
        };
        setPropFilterState(resolvedState);
        // eslint-disable-next-line
        onPropFilterChange(resolvedState as any);
      };
    },
    [setPropFilterState, onPropFilterChange, propFilterState]
  );

  return (
    <FilterBox title="Metadata filter">
      <Text>{t("sampling_date")}</Text>
      <Flex>
        <DatePicker
          selectedDate={sampledStartDate}
          isClearable
          onChange={onDateChange("sampling_date", "min", setSampledStartDate)}
          placeholderText={t("From")}
        />
        <DatePicker
          selectedDate={sampledEndDate}
          isClearable
          onChange={onDateChange("sampling_date", "max", setSampledEndDate)}
          placeholderText={t("To")}
        />
      </Flex>
      <Text mt={2}>{t("Organisation")}</Text>
      <Select
        options={organisationOptions}
        isMulti
        theme={selectTheme}
        onChange={onChangeBuilder("institution")}
      />
      <Text mt={2}>{t("Projekt")}</Text>
      <Select
        options={projectOptions}
        isMulti
        theme={selectTheme}
        onChange={onChangeBuilder("project_title")}
      />
      <Text mt={2}>{t("Modtagedato")}</Text>
      <Flex>
        <DatePicker
          selectedDate={receivedStartDate}
          isClearable
          onChange={onDateChange("received_date", "min", setReceivedStartDate)}
          placeholderText={t("From")}
        />
        <DatePicker
          selectedDate={receivedEndDate}
          isClearable
          onChange={onDateChange("received_date", "max", setReceivedEndDate)}
          placeholderText={t("To")}
        />
      </Flex>
      <Text mt={2}>{t("Dyreart")}</Text>
      <Select
        options={speciesOptions}
        isMulti
        theme={selectTheme}
        onChange={onChangeBuilder("provided_species")}
      />
    </FilterBox>
  );
}

export default React.memo(MetaFilter);
