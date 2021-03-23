import React from "react";
import { Box } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { useRequest } from "redux-query-react";
import {
  ComparativeAnalysisNewickSlice,
  getComparativeAnalysisNewick,
} from "./comparative-analysis-configs";
import Tree from "./phylo/phylo";

const newickTreeSelector = (state: {
  entities: ComparativeAnalysisNewickSlice;
}) => state.entities.ComparativeAnalysisNewick;

export default function ComparativeAnalysis() {
  const newickTree = useSelector(newickTreeSelector);
  const jobId = "1";
  const [{ isPending, status }, refresh] = useRequest(
    getComparativeAnalysisNewick(jobId)
  );

  return (
    <Box width="1280px" height="720px">
      <Tree
        leaf_colors={{}}
        onSelected={(ids) => console.log(ids)}
        selectedIDs={[]}
        newick_data={newickTree}
      />
    </Box>
  );
}
