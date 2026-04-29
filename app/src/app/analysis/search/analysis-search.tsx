import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  useToast,
  useDisclosure,
  InputLeftElement,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Tooltip,
} from "@chakra-ui/react";
import {
  CloseIcon,
  SearchIcon,
  QuestionIcon,
  TimeIcon,
  WarningIcon,
} from "@chakra-ui/icons";
import { parse as luceneParse } from "lucene";
import { recurseTree } from "utils";
import { getFieldInternalName } from "app/i18n";
import SearchHelpModal from "./search-help-modal";
import SearchHistoryMenu from "./search-history";
import { SearchQuery } from "../analysis-page";
import { getSearchHistory, recurseSearchTree, useHistoryCB } from "./search-utils";

type AnalysisSearchProps = {
  onSearchChange: (query: SearchQuery, searchString: string) => void;
  isDisabled: boolean;
  searchTerms: Set<string>;
};

const parseQuery = (input: string, onError) => {
  try {
    const ast = luceneParse(input);
    recurseTree(ast, (x) => {
      if (x["field"]) {
        // translate display names to internal names
        x["field"] = getFieldInternalName(x["field"]) ?? x["field"];
      }
    });
    return ast;
  } catch (ex) {
    onError({
      title: "Invalid query syntax",
      description: `${ex}`,
      status: "error",
      isClosable: true,
    });
    return {};
  }
};

const checkQueryError = (input: string, searchTerms: Set<string>) => {
  let error: string | null = null;

  const onError = (err: { description: string }) => {
    error = err.description;
  };
  const ast = parseQuery(input, onError);
  if (error) return error;

  const operands = recurseSearchTree(ast);

  const invalidTerms = operands
    .map((o) => (o.field == "<implicit>" ? o.term : o.field))
    .filter((field) => !searchTerms.has(field.toLowerCase()));
  if (invalidTerms.length) {
    return "Cannot search for " + invalidTerms.map((t) => `"${t}"`).join(", ");
  }

  return null;
};

const AnalysisSearch = (props: AnalysisSearchProps) => {
  const { onSearchChange, isDisabled, searchTerms } = props;
  const inputRef = React.useRef<HTMLInputElement>();
  const toast = useToast();
  const [input, setInput] = React.useState("");
  const onInput = React.useCallback((e) => setInput(e.target.value), [
    setInput,
  ]);


  const historyCB = useCallback(() => {
    const history = getSearchHistory();
    if (history.length === 0) return;

    const searchString = history[0].searchString
    if (inputRef) {
      setInput(searchString);
      inputRef.current.value = searchString;
    }
  }, [inputRef, setInput])
  useHistoryCB(historyCB, false);

  const error = useMemo(() => {
    return checkQueryError(input, searchTerms);
  }, [input, searchTerms]);

  const submitQuery = React.useCallback(
    (q?: string, clearAllFields?: boolean) =>
      onSearchChange({
        expression: parseQuery(q == undefined ? input : q, toast),
        clearAllFields,
      }, input),
    [onSearchChange, input, toast]
  );

  const submit = React.useCallback(() => submitQuery(), [submitQuery]);

  const clearInput = React.useCallback(() => setInput(""), [setInput]);

  const onClearButton = React.useCallback(() => {
    inputRef.current.value = "";
    clearInput();
    submitQuery("", true);
  }, [clearInput, submitQuery]);

  const onEnterKey = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) =>
      (e.key === "Enter" || e.key === "NumpadEnter") && submitQuery(),
    [submitQuery]
  );

  const {
    isOpen: isSearchHelpModalOpen,
    onOpen: onSearchHelpModalOpen,
    onClose: onSearchHelpModalClose,
  } = useDisclosure();

  return (
    <>
      <React.Fragment>
        <SearchHelpModal
          isOpen={isSearchHelpModalOpen}
          onClose={onSearchHelpModalClose}
        />
        <InputGroup>
          <Input
            ref={inputRef}
            placeholder={`species_final:"Escherichia coli"`}
            onInput={onInput}
            onKeyDown={onEnterKey}
            onSubmit={submit}
            isDisabled={isDisabled}
          />
          <InputLeftElement>
            <QuestionIcon
              color="gray.400"
              onClick={onSearchHelpModalOpen}
              cursor="pointer"
            />
          </InputLeftElement>

          <InputRightElement width="18" marginRight="2">
            {error && (
              <Tooltip label={error}>
                <WarningIcon
                  color="orange.400"
                  cursor="pointer"
                  height="max"
                  marginRight="2"
                />
              </Tooltip>
            )}
            <CloseIcon
              color="gray.400"
              onClick={onClearButton}
              cursor="pointer"
            />
          </InputRightElement>
        </InputGroup>
        <IconButton
          aria-label="Search database"
          icon={<SearchIcon />}
          ml="1"
          onClick={submit}
          isDisabled={isDisabled}
        />
      </React.Fragment>
      <Popover placement="bottom-start">
        <PopoverTrigger>
          <IconButton aria-label="Open history" icon={<TimeIcon />} ml="1" />
        </PopoverTrigger>
        <PopoverContent>
          <SearchHistoryMenu onSearchChange={onSearchChange} />
        </PopoverContent>
      </Popover>
    </>
  );
};

export default React.memo(AnalysisSearch);
