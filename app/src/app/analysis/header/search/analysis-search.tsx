/** @jsxRuntime classic */
/** @jsx jsx */
import React from "react";
import { Input, IconButton } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { jsx } from "@emotion/react";
import { AnalysisQuery } from 'sap-client';

type AnalysisSearchProps = {
  onSubmit: (query: AnalysisQuery) => void;
};

const parseQuery = (input: string) =>
  input
    .replace(": ", ":")
    .split(" ")
    .map((kv) => ({ [kv.split(":")[0]]: kv.split(":")[1] }))
    .reduce((a, b) => ({ ...a, ...b }), {});

const AnalysisSearch = (props: AnalysisSearchProps) => {
  const { onSubmit } = props;
  const [input, setInput] = React.useState("");
  const onInput = React.useCallback((e) => setInput(e.target.value), [
    setInput,
  ]);
  const submitQuery = React.useCallback(() => onSubmit(parseQuery(input)), [
    onSubmit,
    input,
  ]);
  const onEnterKey = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) =>
      (e.key === "Enter" || e.key === "NumpadEnter") && submitQuery(),
    [submitQuery]
  );
  return (
    <React.Fragment>
      <Input
        placeholder="species: e.coli"
        onInput={onInput}
        onKeyDown={onEnterKey}
        onSubmit={submitQuery}
      />
      <IconButton
        aria-label="Search database"
        icon={<SearchIcon />}
        ml="4"
        onClick={submitQuery}
      />
    </React.Fragment>
  );
};

export default React.memo(AnalysisSearch);
