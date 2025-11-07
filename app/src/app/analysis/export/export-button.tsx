import React from "react";
import { IconButton } from "@chakra-ui/react";
import { DownloadIcon } from "@chakra-ui/icons";
import { AnalysisResult } from "sap-client";
import { convertToCsv, downloadFile } from "./data-export";
import { spyDataTable } from "../data-table/table-spy";
import { DataTableSelection } from "../data-table/data-table";

type ExportButtonProps = {
  data: AnalysisResult[];
  selection: DataTableSelection<AnalysisResult>;
};

const isSelectionEmpty = (sel) => Object.keys(sel).length === 0;

const ExportButton = (props: ExportButtonProps) => {
  const { data,  selection } = props;

  let exportData = data;
  if (!isSelectionEmpty(selection)) {
    const filteredData = data.filter((item) =>
      selection.hasOwnProperty(item.sequence_id)
    );
    exportData = filteredData;
  }

  const download = React.useCallback(() => {
    const keys = Object.keys(exportData[0]) as (keyof AnalysisResult)[]
    const tsv = convertToCsv<AnalysisResult>(exportData, keys, "\t");
    downloadFile(tsv, "sofi-export.tsv");
  }, [exportData]);

  return (
    <IconButton
      aria-label="Export data"
      icon={<DownloadIcon />}
      size="sm"
      ml="1"
      onClick={download}
    />
  );
};

export default React.memo(ExportButton);
