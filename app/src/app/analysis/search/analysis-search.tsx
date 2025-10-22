import React from "react";
import {
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  useToast,
  useDisclosure,
  InputLeftElement,
} from "@chakra-ui/react";
import { CloseIcon, SearchIcon, QuestionIcon } from "@chakra-ui/icons";
import { AnalysisQuery } from "sap-client";
import { parse as luceneParse } from "lucene";
import { recurseTree } from "utils";
import { getFieldInternalName } from "app/i18n";
import SearchHelpModal from "./search-help-modal";

type AnalysisSearchProps = {
  onSubmit: (query: AnalysisQuery, pageSize: number) => void;
  isDisabled: boolean;
};

const parseQuery = (input: string, toast) => {
  try {
    const ast = luceneParse(input);
    console.log(ast);
    recurseTree(ast, (x) => {
      if (x["field"]) {
        // translate display names to internal names
        x["field"] = getFieldInternalName(x["field"]) ?? x["field"];
      }
    });
    return ast;
  } catch (ex) {
    toast({
      title: "Invalid query syntax",
      description: `${ex}`,
      status: "error",
      isClosable: true,
    });
    return {};
  }
};

const AnalysisSearch = (props: AnalysisSearchProps) => {
  const { onSubmit, isDisabled } = props;
  const inputRef = React.useRef<HTMLInputElement>();
  const toast = useToast();
  const [input, setInput] = React.useState("");
  const onInput = React.useCallback((e) => setInput(e.target.value), [
    setInput,
  ]);

  const submitQuery = React.useCallback(
    (q?: string) =>
      onSubmit({ expression: parseQuery(q || input, toast) }, 100),
    [onSubmit, input, toast]
  );

  const submit = React.useCallback(() => submitQuery(), [submitQuery]);

  const clearInput = React.useCallback(() => setInput(""), [setInput]);

  const onClearButton = React.useCallback(() => {
    inputRef.current.value = "";
    clearInput();
    submitQuery("");
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

        <InputRightElement>
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
  );
};

export default React.memo(AnalysisSearch);
