import React, { useEffect, useState } from "react";
import { Text, Flex } from "@chakra-ui/react";
import Select, { ActionMeta, OptionTypeBase, ValueType } from "react-select";
import { selectTheme } from "app/app.styles";
import { useTranslation } from "react-i18next";
import { AnalysisResult, DataClearance, Organization, QueryExpression, QueryOperand } from "sap-client";
import { IfPermission } from "auth/if-permission";
import { PropFilter, RangeFilter } from "utils";
import FilterBox from "../filter-box";
import DatePicker from "./date-picker";

type MetaFilterProps = {
  organisations: string[];
  projects: string[];
  projectNrs: string[];
  dyreart: string[];
  runIds: string[];
  isolateIds: string[];
  cprs: string[];
  fuds: string[];
  clusters: string[];
  onPropFilterChange: (resultingFilter: PropFilter<AnalysisResult>) => void;
  onRangeFilterChange: (resultingFilter: RangeFilter<AnalysisResult>) => void;
  isDisabled: boolean;
};

function MetaFilter(props: MetaFilterProps) {
  const {
    organisations,
    projects,
    projectNrs,
    dyreart,
    runIds,
    isolateIds,
    cprs,
    fuds,
    clusters,
    onPropFilterChange,
    onRangeFilterChange,
    isDisabled,
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
      const minDate = null;
      const maxDate = null;
      const oppositeValue =
        opposite === "min"
          ? rangeFilterState[field]?.min ?? minDate
          : rangeFilterState[field]?.max ?? maxDate;
      const val = d !== null ? d : end === "min" ? minDate : maxDate;
      const resolvedState = {
        ...rangeFilterState,
        [field]: (val ||oppositeValue) ? { [end]: val, [opposite]: oppositeValue } : undefined,
      };
      setRangeFilterState(resolvedState);
      onRangeFilterChange(resolvedState);
    },
    [rangeFilterState, setRangeFilterState, onRangeFilterChange]
  );

  const organisationOptions = React.useMemo(
    () => organisations.filter(Boolean).map((x) => ({ value: x, label: x })),
    [organisations]
  );
  const projectOptions = React.useMemo(
    () => projects.filter(Boolean).map((x) => ({ value: x, label: x })),
    [projects]
  );
  const projectNrOptions = React.useMemo(
    () => projectNrs.filter(Boolean).map((x) => ({ value: x, label: x })),
    [projectNrs]
  );
  const dyreartOptions = React.useMemo(
    () => dyreart.filter(Boolean).map((x) => ({ value: x, label: x })),
    [dyreart]
  );
  const runIdsOptions = React.useMemo(
    () => runIds.filter(Boolean).map((x) => ({ value: x, label: x })),
    [runIds]
  );
  const isolateIdsOptions = React.useMemo(
    () => isolateIds.filter(Boolean).map((x) => ({ value: x, label: x })),
    [isolateIds]
  );
  const cprOptions = React.useMemo(
    () => cprs.filter(Boolean).map((x) => ({ value: x, label: x })),
    [cprs]
  );
  const fudOptions = React.useMemo(
    () => fuds.filter(Boolean).map((x) => ({ value: x, label: x })),
    [fuds]
  );
  const clusterOptions = React.useMemo(
    () => clusters.filter(Boolean).map((x) => ({ value: x, label: x })),
    [clusters]
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
        console.log("MANUAL CHANGE TO",field);
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
      <Text>{t("date_sample")}</Text>
      <Flex>
        <DatePicker
          selectedDate={sampledStartDate}
          isClearable
          onChange={onDateChange("date_sample", "min", setSampledStartDate)}
          placeholderText={t("From")}
          isDisabled={isDisabled}
        />
        <DatePicker
          selectedDate={sampledEndDate}
          isClearable
          onChange={onDateChange("date_sample", "max", setSampledEndDate)}
          placeholderText={t("To")}
          isDisabled={isDisabled}
        />
      </Flex>
      <Text mt={2}>{t("institution")}</Text>
      <Select
        options={organisationOptions}
        isMulti
        theme={selectTheme}
        onChange={onChangeBuilder("institution")}
        isDisabled={isDisabled}
      />
      <Flex justifyContent="space-between" direction="row">
        <Flex direction="column" width="100%">
          <Text mt={2}>{t("project_title")}</Text>
          <Select
            options={projectOptions}
            isMulti
            theme={selectTheme}
            onChange={onChangeBuilder("project_title")}
            isDisabled={isDisabled}
          />
        </Flex>
        <Flex direction="column" width="100%">
          <Text mt={2}>{t("project_number")}</Text>
          <Select
            options={projectNrOptions}
            isMulti
            theme={selectTheme}
            onChange={onChangeBuilder("project_number")}
            isDisabled={isDisabled}
          />
        </Flex>
      </Flex>
      <Text mt={2}>{t("date_received")}</Text>
      <Flex>
        <DatePicker
          selectedDate={receivedStartDate}
          isClearable
          onChange={onDateChange("date_received", "min", setReceivedStartDate)}
          placeholderText={t("From")}
          isDisabled={isDisabled}
        />
        <DatePicker
          selectedDate={receivedEndDate}
          isClearable
          onChange={onDateChange("date_received", "max", setReceivedEndDate)}
          placeholderText={t("To")}
          isDisabled={isDisabled}
        />
      </Flex>
      <Text mt={2}>{t("animal_species")}</Text>
      <Select
        options={dyreartOptions}
        isMulti
        theme={selectTheme}
        onChange={onChangeBuilder("animal_species")}
        isDisabled={isDisabled}
      />
      <Flex justifyContent="space-between" direction="row">
        <Flex direction="column" width="100%">
          <Text mt={2}>{t("run_id")}</Text>
          <Select
            options={runIdsOptions}
            isMulti
            theme={selectTheme}
            onChange={onChangeBuilder("run_id")}
            isDisabled={isDisabled}
          />
        </Flex>
        <Flex direction="column" width="100%">
          <Text mt={2}>{t("isolate_id")}</Text>
          <Select
            options={isolateIdsOptions}
            isMulti
            theme={selectTheme}
            onChange={onChangeBuilder("isolate_id")}
            isDisabled={isDisabled}
          />
        </Flex>
      </Flex>
      <IfPermission
        level={DataClearance.cross_institution}
        institution={Organization.SSI}
      >
        <Text mt={2}>{t("cpr_nr")}</Text>
        <Select
          options={cprOptions}
          isMulti
          theme={selectTheme}
          onChange={onChangeBuilder("cpr_nr")}
          isDisabled={isDisabled}
        />
      </IfPermission>
      <Flex justifyContent="space-between" direction="row">
        <Flex direction="column" width="100%">
          <Text mt={2}>{t("fud_number")}</Text>
          <Select
            options={fudOptions}
            isMulti
            theme={selectTheme}
            onChange={onChangeBuilder("fud_number")}
            isDisabled={isDisabled}
          />
        </Flex>
        <Flex direction="column" width="100%">
          <Text mt={2}>{t("cluster_id")}</Text>
          <Select
            options={clusterOptions}
            isMulti
            theme={selectTheme}
            onChange={onChangeBuilder("cluster_id")}
            isDisabled={isDisabled}
          />
        </Flex>
      </Flex>
    </FilterBox>
  );
}

export default MetaFilter;
