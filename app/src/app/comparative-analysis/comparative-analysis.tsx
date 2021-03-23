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
  const [selected, setSelected] = React.useState([]);
  const newickTree = useSelector(newickTreeSelector);
  const jobId = "1";
  const [{ isPending, status }, refresh] = useRequest(
    getComparativeAnalysisNewick(jobId)
  );

  const newickData = React.useMemo(() => newickTree, [newickTree]);
  const leafColors = React.useMemo(() => ({}), []);
  const selectedIds = React.useMemo(() => selected, [selected]);

  const onSelected = React.useCallback(
    (ids) => {
      setSelected(ids);
    },
    [setSelected]
  );

  // const reset = React.useCallback((_e) => {setSelected(["Bovine"])}, [setSelected])
  // <button onClick={reset}>Set selected</button>
  return (
    <Box width="100%" height="100%">
      <Tree
        leaf_colors={leafColors}
        onSelected={onSelected}
        selectedIDs={selectedIds}
        newick_data={newickData}
      />
    </Box>
  );
}
