import React, { useState } from "react";
import { Box, Button, Flex, useToast } from "@chakra-ui/react";
import { Column } from "react-table";
import { AnalysisResult, UserDefinedView } from "sap-client";
import { useRequest, useRequests } from "redux-query-react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { RootState } from "app/root-reducer";
import DataTable from "./data-table/data-table";
import { approvedCell, selectedCell } from "./data-table/data-table.styles";
import { requestPageOfAnalysis, requestColumns, ColumnSlice } from "./analysis-query-configs";
import AnalysisHeader from "./header/analysis-header";
import AnalysisSidebar from "./sidebar/analysis-sidebar";
import { setSelection } from "./analysis-selection-configs";

export default function AnalysisPage() {
  const reqs = React.useMemo(
    () =>
      Array.from(Array(5).keys()).map((i) => ({
        ...requestPageOfAnalysis({ pageSize: 1000 }),
        queryKey: `${i}`,
      })),
    []
  );
  const [columnLoadState] = useRequest(requestColumns());
  const [{ isPending, isFinished }] = useRequests(reqs);
  // TODO: Figure out how to make this strongly typed
  const data = useSelector<RootState>((s) =>
    Object.values(s.entities.analysis ?? {})
  ) as AnalysisResult[];

  const columnConfigs = useSelector<RootState>(
    (s) => s.entities.columns
  ) as ColumnSlice;

  const columns = React.useMemo(
    () =>
      Object.keys(columnConfigs || []).map(
        (k) =>
          ({
            accessor: k,
            Header: k,
          } as Column<AnalysisResult>)
      ),
    [columnConfigs]
  );

  const [pageState, setPageState] = useState({ isNarrowed: false });

  const dispatch = useDispatch();
  const selection = useSelector<RootState>((s) => s.selection.selection);
  const view = useSelector<RootState>((s) => s.view.view) as UserDefinedView;

  const toast = useToast();
  const { t } = useTranslation();

  const canSelectColumn = React.useCallback((columnName: string) => {
    return columnConfigs[columnName]?.approvable;
  }, [columnConfigs]);

  const canEditColumn = React.useCallback((columnName: string) => {
    return columnConfigs[columnName]?.editable;
  }, [columnConfigs]);

  const approveSelection = React.useCallback(() => {
    toast({
      title: t("Approval submitted"),
      description: `${data.filter((x) => selection[x.isolate_id]).length} ${t(
        "records"
      )} ${t("have been submitted for approval.")}`,
      status: "info",
      duration: null,
      isClosable: true,
    });
  }, [selection, toast, data, t]);

  const sidebarWidth = "300px";
  if (!columnLoadState.isFinished) {
    return (<div>Loading</div>);
  }
  return (
    <Box w="100%">
      <AnalysisHeader sidebarWidth={sidebarWidth} />
      <Flex mt={5}>
        <Box minW={sidebarWidth} pr={5}>
          <AnalysisSidebar />
        </Box>
        <Box borderWidth="1px" rounded="md" overflowX="auto">
          <Box margin="4px">
            <Button
              margin="4px"
              onClick={() =>
                setPageState({
                  ...pageState,
                  isNarrowed: !pageState.isNarrowed,
                })
              }
            >
              {pageState.isNarrowed ? t("Cancel") : t("Select")}
            </Button>
            <Button
              margin="4px"
              disabled={!pageState.isNarrowed}
              onClick={approveSelection}
            >
              {t("Approve")}
            </Button>
          </Box>
          <DataTable<AnalysisResult>
            columns={columns.filter(x => view.columns.length === 0 || view.columns.includes(x.Header as string)) /* todo: filter on permission level */}
            canSelectColumn={canSelectColumn}
            canEditColumn={canEditColumn}
            data={
              pageState.isNarrowed
                ? data.filter((x) => selection[x.isolate_id])
                : data
            }
            primaryKey="isolate_id"
            selectionStyle={pageState.isNarrowed ? approvedCell : selectedCell}
            onSelect={(sel) => dispatch(setSelection(sel))}
          />
          {isPending && `${t("Fetching...")} ${data.length}`}
          {isFinished &&
            !pageState.isNarrowed &&
            `${t("Found")} ${data.length} ${t("records")}.`}
          {isFinished &&
            pageState.isNarrowed &&
            `${t("Staging")} ${
              data.filter((x) => selection[x.isolate_id]).length
            } ${t("records")}.`}
        </Box>
      </Flex>
    </Box>
  );
}
