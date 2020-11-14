import React, { useState } from "react";
import { Text, Button, SimpleGrid } from "@chakra-ui/react";
import Select from "react-select";
import { selectTheme } from "app/app.styles";
import DatePicker from "react-datepicker";

import { useTranslation } from "react-i18next";
import FilterBox from "../filter-box";
import "react-datepicker/dist/react-datepicker.css";

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

export default function MetaFilter() {
  const { t, i18n } = useTranslation();
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
  return (
    <FilterBox title="Metadata filter">
      <Text>Prøvetagningsdato</Text>
      <SimpleGrid columns={2}>
        <DatePicker
          selected={startDate}
          isClearable
          onChange={(c) => setStartDate(c as any)}
          placeholderText="-"
          customInput={<ExampleCustomInput value="" onClick={(_) => {}} />}
        />
        <DatePicker
          selected={startDate}
          isClearable
          onChange={(c) => setStartDate(c as any)}
          placeholderText="-"
          customInput={<ExampleCustomInput value="" onClick={(_) => {}} />}
        />
      </SimpleGrid>
      <Text mt={2}>{t("Organisation")}</Text>
      <Select options={agensOptions} isMulti theme={selectTheme} />
      <Text mt={2}>{t("Projekt")}</Text>
      <Select options={serotypOptions} isMulti theme={selectTheme} />
      <Text mt={2}>{t("Modtagedato")}</Text>
      <SimpleGrid columns={2}>
        <DatePicker
          selected={startDate}
          isClearable
          onChange={(c) => setStartDate(c as any)}
          placeholderText="-"
          customInput={<ExampleCustomInput value="" onClick={(_) => {}} />}
        />
        <DatePicker
          selected={startDate}
          isClearable
          onChange={(c) => setStartDate(c as any)}
          placeholderText="-"
          customInput={<ExampleCustomInput value="" onClick={(_) => {}} />}
        />
      </SimpleGrid>
      <Text mt={2}>{t("Dyreart")}</Text>
      <Select options={rfvOptions} isMulti theme={selectTheme} />
    </FilterBox>
  );
}
