import React from "react";
import { ScrollSync, ScrollSyncNode } from "scroll-sync-react";
import { Text, List, ListIcon, ListItem } from "@chakra-ui/react";
import { jsx } from "@emotion/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { AnalysisResult } from "sap-client";
import {
  tableStyle,
  tableBorders,
  overflowWrapper,
} from "./analysis-history-table-styles";
import { IsolateWithData } from "./analysis-history-configs";

type SequenceListItemProps = {
  sequenceId: string;
  analysisData: AnalysisResult;
};

type SequenceListItemState = {
  expanded: boolean;
};

const group = "historyscroller";

class IsolateListItem extends React.Component<
  SequenceListItemProps,
  SequenceListItemState
> {
  constructor(props) {
    super(props);
    this.state = { expanded: false };
    this.toggleExpanded = this.toggleExpanded.bind(this);
  }

  private toggleExpanded() {
    this.setState({ expanded: !this.state.expanded });
  }

  render() {
    return (
      <ListItem>
        <Text
          fontSize="lg"
          onClick={this.toggleExpanded}
          cursor="pointer"
          display="inline"
        >
          <ListIcon as={ChevronRightIcon} color="green.500" />
          {this.props.sequenceId}
        </Text>
        {this.state.expanded && (
          <ScrollSyncNode group={group} key={this.props.sequenceId}>
            <div css={overflowWrapper}>
              <table css={tableStyle}>
                <thead>
                  <tr>
                    {Object.keys(this.props.analysisData).map((col) => (
                      <th css={tableBorders} key={`h_${col}`}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    {Object.keys(this.props.analysisData).map((col) => (
                      <td css={tableBorders} key={`d_${col}`}>
                        {JSON.stringify(this.props.analysisData[col])}
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
  }
}

type AnalysisHistoryTableProps = {
  sequences: IsolateWithData;
};

class AnalysisHistoryTable extends React.Component<AnalysisHistoryTableProps> {
  private sortedIds = Object.keys(this.props.sequences).sort().reverse();

  render() {
    return (
      <ScrollSync>
        <List spacing={3} fontSize="1.25em">
          {this.sortedIds.map((sequenceId) => (
            <IsolateListItem
              key={sequenceId}
              sequenceId={sequenceId}
              analysisData={this.props.sequences[sequenceId]}
            />
          ))}
        </List>
      </ScrollSync>
    );
  }
}

export default AnalysisHistoryTable;
