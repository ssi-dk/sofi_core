import React from "react";
import { IconButton } from "@chakra-ui/react";
import { DownloadIcon } from "@chakra-ui/icons";
import { AnalysisResult } from "sap-client";
import { convertToCsv, downloadFile } from "./data-export";
import { spyDataTable } from "../data-table/table-spy";
import { DataTableSelection } from "../data-table/data-table";

type ExportButtonProps = {
  data: AnalysisResult[];
  columns: (keyof AnalysisResult)[];
  selection: DataTableSelection<AnalysisResult>;
};

const isSelectionEmpty = (sel) => Object.keys(sel).length === 0;

const ExportButton = (props: ExportButtonProps) => {
  const { data, columns, selection } = props;

  const download = React.useCallback(() => {
    const tableState = spyDataTable();
    let columnsToExport = columns;

    if (tableState.columnOrder && tableState.columnOrder.length) {
      columnsToExport = tableState.columnOrder;
    }
    if (tableState.hiddenColumns && tableState.hiddenColumns.length) {
      columnsToExport = columnsToExport.filter(
        (x) => tableState.hiddenColumns.indexOf(x) < 0
      );
    }

    const tsv = convertToCsv<AnalysisResult>(data, columnsToExport, "\t");
    downloadFile(tsv, "sofi-export.tsv");
  }, [columns, data]);

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
