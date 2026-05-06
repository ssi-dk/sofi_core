import { Button, Flex, IconButton } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import {
  displayOperandName,
  getSearchHistory,
  recurseSearchTree,
  SearchHistory,
  setPinned,
  useHistoryCB,
} from "./search-utils";
import { SearchIcon, StarIcon } from "@chakra-ui/icons";
import { AnalysisQuery } from "sap-client";
import { SearchQuery } from "../analysis-page";

const SearchHistoryMenu = (props: {
  onSearchChange: (query: SearchQuery, searchString) => void;
}) => {
  const { onSearchChange } = props;
  const [searchHistory, setSearchHistory] = useState<SearchHistory>([]);


  const historyCB = useCallback(() => {
    setSearchHistory(getSearchHistory())
  }, [setSearchHistory])

  useHistoryCB(historyCB, true)


  return (
    <Flex direction="column" style={{ margin: "3px" }}>
      <b>Search history</b>
      <Flex direction="column" style={{ marginLeft: "6px" }}>
        {/* TODO: Make pretty */}
        {searchHistory.map((s) => (
          <Flex
            direction="row"
            alignItems="center"
            key={s.timestamp}
            style={{
              margin: "4px",
              border: "lightGray",
              borderWidth: "1px",
              borderRadius: "8px",
              borderStyle: "solid",
            }}
          >
            <IconButton
              aria-label="Pin"
              icon={
                <StarIcon
                  {...(s.pinned
                    ? { color: "gold" }
                    : { fillOpacity: 0, stroke: "black" })}
                />
              }
              ml="1"
              onClick={() => setPinned(s, !s.pinned)}
              style={{ margin: "4px" }}
            />
            <IconButton
              aria-label="Search database"
              icon={<SearchIcon />}
              ml="1"
              onClick={() =>
                onSearchChange({ expression: s.query, clearAllFields: true }, s.searchString)
              }
              style={{ margin: "4px" }}
            />
            <p>
              {recurseSearchTree(s.query).map(displayOperandName).join(", ")}
            </p>
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
};

export default SearchHistoryMenu;
