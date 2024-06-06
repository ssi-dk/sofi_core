import React, { useCallback, useState } from "react";
import { ScrollSyncNode } from "scroll-sync-react";
import { Text, ListIcon, ListItem } from "@chakra-ui/react";
import "@compiled/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { AnalysisResult } from "sap-client";

type Props = {
  sequenceId: string;
  analysisData: AnalysisResult;
};

export const IsolateListItem = (props: Props) => {
  const { sequenceId, analysisData } = props;
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => !prev);
  }, [setExpanded]);

  return (
    <ListItem>
      <Text
        fontSize="lg"
        onClick={toggleExpanded}
        cursor="pointer"
        display="inline"
      >
        <ListIcon as={ChevronRightIcon} color="green.500" />
        {sequenceId}
      </Text>
      {expanded && (
        <ScrollSyncNode group="history-scroll" key={sequenceId}>
          <div className="sofi-overflow-wrapper">
            <table className="sofi-table-style">
              <thead>
                <tr>
                  {Object.keys(analysisData).map((col) => (
                    <th className="sofi-table-border" key={`h_${col}`}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                <tr>
                  {Object.keys(analysisData).map((col) => (
                    <td className="sofi-table-border" key={`d_${col}`}>
                      {typeof analysisData[col] === "string"
                        ? analysisData[col]
                        : JSON.stringify(analysisData[col])}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </ScrollSyncNode>
      )}
    </ListItem>
  );
};
