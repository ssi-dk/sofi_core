/** @jsxRuntime classic */
/** @jsxFrag React.Fragment */
/** @jsx jsx */
import React, { Fragment, useState } from "react";
import { Text, List, ListItem, ListIcon, OrderedList, UnorderedList } from "@chakra-ui/react";
import { jsx } from "@emotion/react"
import { ChevronRightIcon, ChevronDownIcon, SettingsIcon } from "@chakra-ui/icons"
import { AnalysisResult } from "sap-client";
import { useTranslation } from "react-i18next";
import { tableStyle, tableBorders, overflowWrapper } from "./analysis-history-table-styles"
import { IsolateWithData } from "./analysis-history-configs";


type SequenceListItemProps = {
  sequenceId: string;
  analysisData: AnalysisResult;
}

const IsolateListItem = (props: SequenceListItemProps) => {
  const { sequenceId, analysisData } = props;
  const [expanded, setExpanded] = useState(false);

  return (
    <ListItem>
      <Text fontSize="lg" onClick={() => setExpanded(!expanded)} cursor="pointer" display="inline">
        <ListIcon as={ChevronRightIcon} color="green.500" />
        {sequenceId}
      </Text>
      {expanded &&
      <div css={overflowWrapper}>
        <table css={tableStyle}>
          <thead>
            <tr>
              {Object.keys(analysisData).map(col => <th css={tableBorders} key={`h_${col}`}>{col}</th>)}
            </tr>
          </thead>

          <tbody>
            <tr>
              {Object.keys(analysisData).map(col => <td css={tableBorders} key={`d_${col}`}>{JSON.stringify(analysisData[col])}</td>)}
            </tr>
          </tbody>
        </table></div>}
    </ListItem>
  );
}

type AnalysisHistoryTableProps = {
  sequences: IsolateWithData;
};

const AnalysisHistoryTable = (props: AnalysisHistoryTableProps) => {
  const { t } = useTranslation();
  const { sequences } = props;
  const sortedIds = Object.keys(sequences).sort();
  return (
    <List spacing={3} fontSize="1.25em">
      {sortedIds.map(sequenceId =>
        <IsolateListItem key={sequenceId} sequenceId={sequenceId} analysisData={sequences[sequenceId]} />
      )}
    </List>
  );
};

export default React.memo(AnalysisHistoryTable);
