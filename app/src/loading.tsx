import { CircularProgress, Flex } from "@chakra-ui/react";
import React from "react";

export const Loading = () => {
  return (
    <Flex h="100vh" w="100%" alignItems="center" justifyContent="center">
      <CircularProgress isIndeterminate size="120px" />
    </Flex>
  );
};
