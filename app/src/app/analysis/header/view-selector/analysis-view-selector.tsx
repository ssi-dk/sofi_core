import React from "react";
import Select from "react-select";
import { selectTheme } from "app/app.styles";

const options = [
  { value: "v1", label: "View 1" },
  { value: "v2", label: "View 2" },
  { value: "v3", label: "View 3" },
];

export default function AnalysisViewSelector() {
  return <Select options={options} theme={selectTheme} />;
}
