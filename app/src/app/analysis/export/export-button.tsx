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
  onClickOverwrite: () => void | null
};

export const downloadDataToCsv = (data: AnalysisResult[], columns: (keyof AnalysisResult)[]) => {
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
}

const ExportButton = (props: ExportButtonProps) => {
  const { data, columns, onClickOverwrite } = props;

  const downloadPropData = React.useCallback(() => {
    downloadDataToCsv(data, columns);
  }, [columns, data]);

  return (
    <IconButton
      aria-label="Export data"
      icon={<DownloadIcon />}
      size="sm"
      ml="1"
      onClick={onClickOverwrite || downloadPropData}
    />
  );
};

export default React.memo(ExportButton);
