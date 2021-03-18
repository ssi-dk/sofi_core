import React, { useState } from "react";
import { Text, Flex } from "@chakra-ui/react";
import Select, { ActionMeta, OptionTypeBase, ValueType } from "react-select";
import { selectTheme } from "app/app.styles";
import { useTranslation } from "react-i18next";
import { AnalysisResult, DataClearance, Organization } from "sap-client";
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
  const projectNrOptions = React.useMemo(
    () => projectNrs.map((x) => ({ value: x, label: x })),
    [projectNrs]
  );
  const dyreartOptions = React.useMemo(
    () => dyreart.map((x) => ({ value: x, label: x })),
    [dyreart]
  );
  const runIdsOptions = React.useMemo(
    () => runIds.map((x) => ({ value: x, label: x })),
    [runIds]
  );
  const isolateIdsOptions = React.useMemo(
    () => isolateIds.map((x) => ({ value: x, label: x })),
    [isolateIds]
  );
  const cprOptions = React.useMemo(
    () => cprs.map((x) => ({ value: x, label: x })),
    [cprs]
  );
  const fudOptions = React.useMemo(
    () => fuds.map((x) => ({ value: x, label: x })),
    [fuds]
  );
  const clusterOptions = React.useMemo(
    () => clusters.map((x) => ({ value: x, label: x })),
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
      <Text mt={2}>{t("institution")}</Text>
      <Select
        options={organisationOptions}
        isMulti
        theme={selectTheme}
        onChange={onChangeBuilder("institution")}
      />
      <Flex justifyContent="space-between" direction="row">
        <Flex direction="column" width="100%">
          <Text mt={2}>{t("project_title")}</Text>
          <Select
            options={projectOptions}
            isMulti
            theme={selectTheme}
            onChange={onChangeBuilder("project_title")}
          />
        </Flex>
        <Flex direction="column" width="100%">
          <Text mt={2}>{t("project_number")}</Text>
          <Select
            options={projectNrOptions}
            isMulti
            theme={selectTheme}
            onChange={onChangeBuilder("project_number")}
          />
        </Flex>
      </Flex>
      <Text mt={2}>{t("received_date")}</Text>
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
      <Text mt={2}>{t("dyreart")}</Text>
      <Select
        options={dyreartOptions}
        isMulti
        theme={selectTheme}
        onChange={onChangeBuilder("species_final")}
      />
      <Flex justifyContent="space-between" direction="row">
        <Flex direction="column" width="100%">
          <Text mt={2}>{t("run_id")}</Text>
          <Select
            options={runIdsOptions}
            isMulti
            theme={selectTheme}
            onChange={onChangeBuilder("run_id")}
          />
        </Flex>
        <Flex direction="column" width="100%">
          <Text mt={2}>{t("isolate_id")}</Text>
          <Select
            options={isolateIdsOptions}
            isMulti
            theme={selectTheme}
            onChange={onChangeBuilder("isolate_id")}
          />
        </Flex>
      </Flex>
      <IfPermission
        level={DataClearance.cross_institution}
        institution={Organization.SSI}
      >
        <Text mt={2}>{t("cpr")}</Text>
        <Select
          options={cprOptions}
          isMulti
          theme={selectTheme}
          onChange={onChangeBuilder("cpr_nr")}
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
          />
        </Flex>
        <Flex direction="column" width="100%">
          <Text mt={2}>{t("cluster_id")}</Text>
          <Select
            options={clusterOptions}
            isMulti
            theme={selectTheme}
            onChange={onChangeBuilder("cluster_id")}
          />
        </Flex>
      </Flex>
    </FilterBox>
  );
}

export default React.memo(MetaFilter);
