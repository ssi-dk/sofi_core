import React from "react";
import { Box } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import FilterBox from "../filter-box";

export default function NodeColoringFilter() {
  const { t } = useTranslation();
  const [selected, setSelected] = React.useState([]);

  return <FilterBox title={t("Node coloring")}></FilterBox>;
}
