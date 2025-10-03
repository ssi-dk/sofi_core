import { Button, Flex, IconButton } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { deRegisterHistoryCB, displayOperandName, getSearchHistory, recurseSearchTree, registerHistoryCB, SearchHistory, setPinned } from "./search-utils";
import { SearchIcon, StarIcon } from "@chakra-ui/icons";
import { AnalysisQuery } from "sap-client";

const SearchHistoryMenu = (props: {
    onSearchChange: (query: AnalysisQuery) => void
}) => {
    const {onSearchChange} = props;
    const [searchHistory, setSearchHistory]= useState<SearchHistory>([]);

    useEffect(() => {
        const cb = () => setSearchHistory(getSearchHistory())
        cb();
        registerHistoryCB(cb)
        return () => deRegisterHistoryCB(cb)
    },[])

    return <Flex direction="column" style={{margin: "3px"}}>
        <b>Search history</b>
        <Flex direction="column" style={{marginLeft: "6px"}}>
            {/* TODO: Make pretty */}
            {searchHistory.map(s => <Flex direction="row" alignItems="center" key={s.timestamp} style={{margin: "4px",background: "lightgray", borderRadius: "4px"}} >
                <IconButton
                    aria-label="Pin"
                    icon={<StarIcon {...(s.pinned ? {color: "gold"} : {fillOpacity: 0, stroke:"black"})} />}
                    ml="1"
                    onClick={() => setPinned(s,!s.pinned)}
                    style={{marginRight: "4px"}}
                />
                <IconButton
                    aria-label="Search database"
                    icon={<SearchIcon />}
                    ml="1"
                    onClick={() => onSearchChange({expression: s.query})}
                    style={{marginRight: "4px"}}
                />
                <p>
                    {recurseSearchTree(s.query).map(displayOperandName).join(", ")}
                </p>
            </Flex>)}

        </Flex>
    </Flex>
}




export default SearchHistoryMenu;