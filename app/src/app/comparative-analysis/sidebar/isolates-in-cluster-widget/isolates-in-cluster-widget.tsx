import React from "react";
import { Flex } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import FilterBox from "../filter-box";

export default function IsolatesInClusterWidget() {
  const { t } = useTranslation();

  return (
    <FilterBox title={t("Isolates in cluster")}>
      <Flex direction="column" overflowY="scroll" maxHeight="12rem">
        {[...Array(25)].map((_, i) => (
          <div key={Math.round(i)}>{i}</div>
        ))}
      </Flex>
    </FilterBox>
  );
}
