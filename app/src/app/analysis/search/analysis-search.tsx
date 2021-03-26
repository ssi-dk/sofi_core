import React from "react";
import { Input, IconButton } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { AnalysisQuery } from "sap-client";
import { parse as luceneParse } from "lucene";
import { recurseTree } from "utils";
import { getFieldInternalName } from "app/i18n";

type AnalysisSearchProps = {
  onSubmit: (query: AnalysisQuery) => void;
};

const parseQuery = (input: string) => {
  const ast = luceneParse(input);
  // translate display names to internal names
  recurseTree(ast, (x) => {
    if (x["field"]) {
      x["field"] = getFieldInternalName(x["field"]) ?? x["field"];
    }
  });
  return ast;
};

const AnalysisSearch = (props: AnalysisSearchProps) => {
  const { onSubmit } = props;
  const [input, setInput] = React.useState("");
  const onInput = React.useCallback((e) => setInput(e.target.value), [
    setInput,
  ]);
  const submitQuery = React.useCallback(
    () => onSubmit({ expression: parseQuery(input) }),
    [onSubmit, input]
  );
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
        ml="1"
        onClick={submitQuery}
      />
    </React.Fragment>
  );
};

export default React.memo(AnalysisSearch);
