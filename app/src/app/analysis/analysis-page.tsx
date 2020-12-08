import React, { useState } from "react";
import { Box, Flex, Button, useToast } from "@chakra-ui/react";
import { CheckIcon, DragHandleIcon, NotAllowedIcon } from "@chakra-ui/icons";
import { Column } from "react-table";
import { AnalysisResult, UserDefinedView, ApprovalRequest } from "sap-client";
import { useMutation, useRequest, useRequests } from "redux-query-react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { RootState } from "app/root-reducer";
import DataTable from "./data-table/data-table";
import { approvedCell, selectedCell } from "./data-table/data-table.styles";
import {
  requestPageOfAnalysis,
  requestColumns,
  ColumnSlice,
} from "./analysis-query-configs";
import AnalysisHeader from "./header/analysis-header";
import AnalysisSidebar from "./sidebar/analysis-sidebar";
import { setSelection } from "./analysis-selection-configs";
import {
  sendApproval,
  sendRejection,
} from "./analysis-approval-configs";

export default function AnalysisPage() {
  const { t } = useTranslation();
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
            Header: t(k),
          } as Column<AnalysisResult>)
      ),
    [columnConfigs, t]
  );

  const [pageState, setPageState] = useState({ isNarrowed: false });

  const dispatch = useDispatch();
  const selection = useSelector<RootState>((s) => s.selection.selection);
  const view = useSelector<RootState>((s) => s.view.view) as UserDefinedView;

  const toast = useToast();

  const canSelectColumn = React.useCallback(
    (columnName: string) => {
      return columnConfigs[columnName]?.approvable;
    },
    [columnConfigs]
  );

  const approvableColumns = React.useMemo(
    () =>
      Object.values(columnConfigs || {})
        .map((c) => c?.approves_with)
        .reduce((a, b) => a.concat(b), [])
        .concat(
          Object.values(columnConfigs || {})
            .filter((c) => c?.approvable)
            .map((c) => c?.field_name)
        ),
    [columnConfigs]
  );

  const canApproveColumn = React.useCallback(
    (columnName: string) => {
      return approvableColumns.indexOf(columnName) >= 0;
    },
    [approvableColumns]
  );

  const canEditColumn = React.useCallback(
    (columnName: string) => {
      return columnConfigs[columnName]?.editable;
    },
    [columnConfigs]
  );

  const getDependentColumns = React.useCallback(
    (columnName: keyof AnalysisResult) => {
      return (
        columnConfigs[columnName]?.approves_with ??
        ([] as Array<keyof AnalysisResult>)
      );
    },
    [columnConfigs]
  );

  const [
    { isPending: pendingApproval, status: approvalStatus },
    doApproval,
  ] = useMutation((payload: ApprovalRequest) => sendApproval(payload));
  const [
    { isPending: pendingRejection, status: rejectionStatus },
    doRejection,
  ] = useMutation((payload: ApprovalRequest) => sendRejection(payload));

  const [needsNotify, setNeedsNotify] = useState(true);

  const approveSelection = React.useCallback(() => {
    setNeedsNotify(true);
    doApproval({ matrix: selection as any });
  }, [selection, doApproval, setNeedsNotify]);

  const rejectSelection = React.useCallback(() => {
      setNeedsNotify(true);
      doRejection({ matrix: selection as any});
    },
    [selection, doRejection, setNeedsNotify]
  );

  // Display approval toasts
  React.useMemo(() => {
    if (
      needsNotify &&
      approvalStatus >= 200 &&
      approvalStatus < 300 &&
      !pendingApproval
    ) {
      toast({
        title: t("Approval submitted"),
        description: `${data.filter((x) => selection[x.isolate_id]).length} ${t(
          "records"
        )} ${t("have been submitted for approval.")}`,
        status: "info",
        duration: null,
        isClosable: true,
      });
      setNeedsNotify(false);
    }
  }, [t, approvalStatus, data, selection, toast, needsNotify, pendingApproval]);

  // Display rejection toasts
  React.useMemo(() => {
    if (
      needsNotify &&
      rejectionStatus >= 200 &&
      rejectionStatus < 300 &&
      !pendingRejection
    ) {
      toast({
        title: t("Rejection submitted"),
        description: `${data.filter((x) => selection[x.isolate_id]).length} ${t(
          "records"
        )} ${t("have been rejected.")}`,
        status: "info",
        duration: null,
        isClosable: true,
      });
      setNeedsNotify(false);
    }
  }, [
    t,
    rejectionStatus,
    data,
    selection,
    toast,
    needsNotify,
    pendingRejection,
  ]);

  const sidebarWidth = "300px";
  if (!columnLoadState.isFinished) {
    return <div>Loading</div>;
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
              leftIcon={<DragHandleIcon />}
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
              leftIcon={<CheckIcon />}
              margin="4px"
              disabled={!pageState.isNarrowed}
              onClick={approveSelection}
            >
              {t("Approve")}
            </Button>
            <Button
              leftIcon={<NotAllowedIcon />}
              margin="4px"
              disabled={!pageState.isNarrowed}
              onClick={rejectSelection}
            >
              {t("Reject")}
            </Button>
          </Box>
          <DataTable<AnalysisResult>
            columns={columns /* todo: filter on permission level */}
            canSelectColumn={canSelectColumn}
            canEditColumn={canEditColumn}
            canApproveColumn={canApproveColumn}
            getDependentColumns={getDependentColumns}
            data={
              pageState.isNarrowed
                ? data.filter((x) => selection[x.isolate_id])
                : data
            }
            primaryKey="isolate_id"
            selectionStyle={pageState.isNarrowed ? approvedCell : selectedCell}
            onSelect={(sel) => dispatch(setSelection(sel))}
            view={view}
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
