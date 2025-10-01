import React from "react";
import { Box } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import {
  ComparativeAnalysisNewickSlice,
} from "./comparative-analysis-configs";
import Header from "../header/header";
import Tree from "./phylo/phylo";
import ComparativeAnalysisSidebar from "./sidebar/comparative-analysis-sidebar";

const newickTreeSelector = (state: {
  entities: ComparativeAnalysisNewickSlice;
}) => state.entities.ComparativeAnalysisNewick;

export default function ComparativeAnalysis() {
  const [selected, setSelected] = React.useState([]);
  const newickTree = useSelector(newickTreeSelector);

  const newickData = React.useMemo(() => newickTree, [newickTree]);
  const leafColors = React.useMemo(() => ({}), []);
  const selectedIds = React.useMemo(() => selected, [selected]);

  const onSelected = React.useCallback(
    (ids) => {
      setSelected(ids);
    },
    [setSelected]
  );

  const sidebarWidth = "300px";
  return (
    <Box
      display="grid"
      gridTemplateRows="5% 5% minmax(0, 80%) 10%"
      gridTemplateColumns="300px auto"
      padding="8"
      height="100vh"
      gridGap="2"
    >
      <Box role="heading" gridColumn="1 / 4">
        <Header sidebarWidth={sidebarWidth} />
      </Box>
      <Box role="form" gridColumn="1 / 1" gridRow="2 / 4">
        <Box minW={sidebarWidth} pr={5}>
          <ComparativeAnalysisSidebar />
        </Box>
      </Box>
      <Box
        role="main"
        gridColumn="2 / 2"
        gridRow="2 / 4"
        borderWidth="1px"
        rounded="md"
      >
        <Tree
          leaf_colors={leafColors}
          onSelected={onSelected}
          selectedIDs={selectedIds}
          newick_data={newickData}
        />
      </Box>
    </Box>
  );
}
