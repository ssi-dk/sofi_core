import React from "react";
import { Input, Button, IconButton } from "@chakra-ui/core";

export default function AnalysisSearch() {
  return (
    <>
      <Input placeholder="agens: e.coli" />
      <IconButton aria-label="Search database" icon="search" ml="4" />
    </>
  );
}
