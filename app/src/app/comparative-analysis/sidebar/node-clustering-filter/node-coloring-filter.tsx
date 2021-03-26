import React from "react";
import { Box, Flex, Heading } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import FilterBox from "../filter-box";
import IndicatorIcon from "../indicator-icon";

export default function NodeColoringFilter() {
  const { t } = useTranslation();

  return (
    <FilterBox title={t("Node coloring")}>
      <Flex direction="column" overflowY="scroll" maxHeight="12rem">
        {[...Array(25)].map((_, i) => (
          <Flex key={Math.round(i)} alignItems="center">
            <IndicatorIcon color="blue.500" />
            {i}
          </Flex>
        ))}
      </Flex>
    </FilterBox>
  );
}
