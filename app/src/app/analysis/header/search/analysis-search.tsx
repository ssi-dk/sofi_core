/** @jsxRuntime classic */
/** @jsx jsx */
import React from "react";
import { Input, IconButton } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { jsx } from "@emotion/react";

const AnalysisSearch = () => {
  return (
    <React.Fragment>
      <Input placeholder="agens: e.coli" />
      <IconButton aria-label="Search database" icon={<SearchIcon />} ml="4" />
    </React.Fragment>
  );
};

export default React.memo(AnalysisSearch);