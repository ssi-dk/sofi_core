import React from "react";
import { ScrollSync } from "scroll-sync-react";
import { List } from "@chakra-ui/react";
import "@compiled/react";
import { IsolateWithData } from "./analysis-history-configs";
import "./analysis-history.css";
import { IsolateListItem } from "./isolate-list-item";

type Props = {
  sequences: IsolateWithData;
};

export const AnalysisHistoryTable = (props: Props) => {
  const sortedIds = Object.keys(props.sequences).sort().reverse();

  return (
    <ScrollSync>
      <List spacing={3} fontSize="1.25em">
        {sortedIds.map((id, index) => (
          <IsolateListItem
            key={`isolate-${index}`}
            sequenceId={props.sequences[id].sequence_id}
            analysisData={props.sequences[id]}
          />
        ))}
      </List>
    </ScrollSync>
  );
};
