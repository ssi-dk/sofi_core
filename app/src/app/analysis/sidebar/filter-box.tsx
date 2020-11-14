import React from "react";
import { Box, Heading } from "@chakra-ui/react";

type FilterBoxProps = {
  title: string;
  children: any;
};

export default function FilterBox({ title, children }: FilterBoxProps) {
  return (
    <Box borderWidth="1px" rounded="md" minH={200} p={2}>
      <Heading as="h5" size="sm" mb={3}>
        {title}
      </Heading>
      {children}
    </Box>
  );
}
