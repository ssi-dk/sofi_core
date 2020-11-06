import React from "react";
import Select from "react-select";
import { selectTheme } from "app/app.styles";
import { Text } from "@chakra-ui/core";
import { useTranslation } from "react-i18next";
import FilterBox from "../filter-box";

const agensOptions = [
  { value: "v1", label: "View 1" },
  { value: "v2", label: "View 2" },
  { value: "v3", label: "View 3" },
];

const serotypOptions = [
  { value: "v1", label: "View 1" },
  { value: "v2", label: "View 2" },
  { value: "v3", label: "View 3" },
];

const rfvOptions = [
  { value: "v1", label: "View 1" },
  { value: "v2", label: "View 2" },
  { value: "v3", label: "View 3" },
];

export default function AnalysisFilter() {
  const { t, i18n } = useTranslation();
  return (
    <FilterBox title="Analysis filter">
      <Text>{t("Agens")}</Text>
      <Select options={agensOptions} isMulti theme={selectTheme} />
      <Text mt={2}>{t("Serotyp")}</Text>
      <Select options={serotypOptions} isMulti theme={selectTheme} />
      <Text mt={2}>{t("ResfinderVersion")}</Text>
      <Select options={rfvOptions} isMulti theme={selectTheme} />
    </FilterBox>
  );
}
