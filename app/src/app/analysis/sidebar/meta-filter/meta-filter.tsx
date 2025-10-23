import React, { useEffect, useState } from "react";
import { Text, Flex } from "@chakra-ui/react";
import Select, { ActionMeta, OptionTypeBase, ValueType } from "react-select";
import { selectTheme } from "app/app.styles";
import { useTranslation } from "react-i18next";
import {
  AnalysisResult,
  DataClearance,
  Organization,
  QueryOperand,
  FilterOptions,
} from "sap-client";
import { IfPermission } from "auth/if-permission";
import { PropFilter, RangeFilter } from "utils";
import FilterBox from "../filter-box";
import DatePicker from "./date-picker";

type MetaFilterProps = {
  filterOptions: FilterOptions;
  onPropFilterChange: (resultingFilter: PropFilter<AnalysisResult>) => void;
  onRangeFilterChange: (resultingFilter: RangeFilter<AnalysisResult>) => void;
  isDisabled: boolean;
  queryOperands: QueryOperand[];
  clearFieldFromSearch: (field: keyof AnalysisResult) => void;
};

function MetaFilter(props: MetaFilterProps) {
  const {
    filterOptions,
    onPropFilterChange,
    onRangeFilterChange,
    isDisabled,
    queryOperands,
    clearFieldFromSearch,
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
        min: AnalysisResult[K] | null;
        max: AnalysisResult[K] | null;
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

      // Use filter options for default min/max dates
      const minDate =
        field === "date_sample"
          ? filterOptions.date_sample?.min
            ? new Date(filterOptions.date_sample.min)
            : null
          : field === "date_received"
          ? filterOptions.date_received?.min
            ? new Date(filterOptions.date_received.min)
            : null
          : null;

      const maxDate =
        field === "date_sample"
          ? filterOptions.date_sample?.max
            ? new Date(filterOptions.date_sample.max)
            : null
          : field === "date_received"
          ? filterOptions.date_received?.max
            ? new Date(filterOptions.date_received.max)
            : null
          : null;

      const oppositeValue =
        opposite === "min"
          ? rangeFilterState[field]?.min ?? minDate
          : rangeFilterState[field]?.max ?? maxDate;
      const val = d !== null ? d : end === "min" ? minDate : maxDate;
      const resolvedState = {
        ...rangeFilterState,
        [field]:
          val || oppositeValue
            ? { [end]: val, [opposite]: oppositeValue }
            : undefined,
      };

      if (val == null && oppositeValue == null) {
        clearFieldFromSearch(field);
      }

      setRangeFilterState(resolvedState);
      onRangeFilterChange(resolvedState);
    },
    [
      rangeFilterState,
      setRangeFilterState,
      onRangeFilterChange,
      clearFieldFromSearch,
      filterOptions,
    ]
  );

  const organisationOptions = React.useMemo(
    () =>
      (filterOptions.institutions || [])
        .filter(Boolean)
        .map((x) => ({ value: x, label: x })),
    [filterOptions.institutions]
  );
  const projectOptions = React.useMemo(
    () =>
      (filterOptions.project_titles || [])
        .filter(Boolean)
        .map((x) => ({ value: x, label: x })),
    [filterOptions.project_titles]
  );
  const projectNrOptions = React.useMemo(
    () =>
      (filterOptions.project_numbers || [])
        .filter(Boolean)
        .map((x) => ({ value: x.toString(), label: x.toString() })),
    [filterOptions.project_numbers]
  );
  const dyreartOptions = React.useMemo(
    () =>
      (filterOptions.animals || [])
        .filter(Boolean)
        .map((x) => ({ value: x, label: x })),
    [filterOptions.animals]
  );
  const runIdsOptions = React.useMemo(
    () =>
      (filterOptions.run_ids || [])
        .filter(Boolean)
        .map((x) => ({ value: x, label: x })),
    [filterOptions.run_ids]
  );
  const isolateIdsOptions = React.useMemo(
    () =>
      (filterOptions.isolate_ids || [])
        .filter(Boolean)
        .map((x) => ({ value: x, label: x })),
    [filterOptions.isolate_ids]
  );
  const cprOptions = React.useMemo(
    () =>
      (filterOptions.fud_nos || [])
        .filter(Boolean)
        .map((x) => ({ value: x, label: x })),
    [filterOptions.fud_nos]
  );
  const fudOptions = React.useMemo(
    () =>
      (filterOptions.fud_nos || [])
        .filter(Boolean)
        .map((x) => ({ value: x, label: x })),
    [filterOptions.fud_nos]
  );
  const clusterOptions = React.useMemo(
    () =>
      (filterOptions.cluster_ids || [])
        .filter(Boolean)
        .map((x) => ({ value: x, label: x })),
    [filterOptions.cluster_ids]
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
        if (!Boolean(value) || (Array.isArray(value) && value.length === 0)) {
          clearFieldFromSearch(field);
        }

        const values = Array.isArray(value) ? value.map((x) => x.value) : [];

        const resolvedState = {
          ...propFilterState,
          [field]: values,
        };

        setPropFilterState(resolvedState);
        onPropFilterChange(resolvedState as any);
      };
    },
    [
      setPropFilterState,
      onPropFilterChange,
      propFilterState,
      clearFieldFromSearch,
    ]
  );

  // When a query changes, set all UI filter to match the query, this is useful when choosing a query from the user history
  useEffect(() => {
    const newPropFilterState = {} as {
      [K in keyof AnalysisResult]: ValueType<OptionTypeBase, true>;
    };
    const newRangeFilterState = {} as {
      [K in keyof AnalysisResult]: {
        min: AnalysisResult[K] | null;
        max: AnalysisResult[K] | null;
      };
    };

    queryOperands.forEach((op) => {
      if (op.field && op.term) {
        if (!newPropFilterState[op.field]) {
          newPropFilterState[op.field] = [];
        }
        if (!newPropFilterState[op.field].includes(op.term)) {
          newPropFilterState[op.field].push(op.term);
        }
      } else if (op.field && (op.term_max || op.term_min)) {
        newRangeFilterState[op.field] = { max: op.term_max, min: op.term_min };

        if (op.field === "date_sample") {
          setSampledStartDate(op.term_min ? new Date(op.term_min) : null);
          setSampledEndDate(op.term_max ? new Date(op.term_max) : null);
        }
        if (op.field === "date_received") {
          setReceivedStartDate(op.term_min ? new Date(op.term_min) : null);
          setReceivedEndDate(op.term_max ? new Date(op.term_max) : null);
        }
      }
    });

    if (!queryOperands.find((q) => q.field === "date_sample")) {
      setSampledStartDate(null);
      setSampledEndDate(null);
    }
    if (!queryOperands.find((q) => q.field === "date_received")) {
      setReceivedStartDate(null);
      setReceivedEndDate(null);
    }

    setPropFilterState(newPropFilterState);
    setRangeFilterState(newRangeFilterState);
  }, [queryOperands]);

  const valueBuilder = (key: keyof AnalysisResult) => {
    return (
      propFilterState[key]?.map((i) => ({
        label: i.toString(),
        value: i.toString(),
      })) || []
    );
  };

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
        value={valueBuilder("institution")}
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
            value={valueBuilder("project_title")}
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
            value={valueBuilder("project_number")}
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
        value={valueBuilder("animal_species")}
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
            value={valueBuilder("run_id")}
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
            value={valueBuilder("isolate_id")}
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
          value={valueBuilder("cpr_nr")}
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
            value={valueBuilder("fud_number")}
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
            value={valueBuilder("cluster_id")}
            theme={selectTheme}
            onChange={onChangeBuilder("cluster_id")}
            isDisabled={isDisabled}
          />
        </Flex>
      </Flex>
    </FilterBox>
  );
}

export default React.memo(MetaFilter);
