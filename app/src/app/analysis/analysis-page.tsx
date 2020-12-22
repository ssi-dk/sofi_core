import React, { useState } from "react";
import { Box, Flex, Button, useToast } from "@chakra-ui/react";
import { NavLink } from 'react-router-dom';
import {
  CalendarIcon,
  CheckIcon,
  DragHandleIcon,
  NotAllowedIcon,
} from "@chakra-ui/icons";
import { Column } from "react-table";
import { AnalysisResult, UserDefinedView, ApprovalRequest, AnalysisQuery } from "sap-client";
import { useMutation, useRequest } from "redux-query-react";
import { useDispatch, useSelector } from "react-redux";
import { requestAsync } from 'redux-query';
import { useTranslation } from "react-i18next";
import { RootState } from "app/root-reducer";
import { predicateBuilder, PropFilter, RangeFilter } from 'utils';
import DataTable from "./data-table/data-table";
import {
  requestPageOfAnalysis,
  requestColumns,
  ColumnSlice,
  searchPageOfAnalysis,
} from "./analysis-query-configs";
import AnalysisHeader from "./header/analysis-header";
import AnalysisSidebar from "./sidebar/analysis-sidebar";
import { setSelection } from "./analysis-selection-configs";
import { sendApproval, sendRejection } from "./analysis-approval-configs";
import { ColumnConfigWidget } from "./data-table/column-config-widget";
import { toggleColumnVisibility } from "./header/view-selector/analysis-view-selection-config";

export default function AnalysisPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const dispatch = useDispatch();

  const [columnLoadState] = useRequest(requestColumns());
  const [{ isPending, isFinished }] = useRequest({...requestPageOfAnalysis({ pageSize: 100 })});
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

  const selection = useSelector<RootState>((s) => s.selection.selection);
  const view = useSelector<RootState>((s) => s.view.view) as UserDefinedView;

  const onSearch = React.useCallback(
    (q: AnalysisQuery) => {
      console.log(q)
      dispatch({ type: "RESET/Analysis" });
      dispatch(
        requestAsync({
          ...searchPageOfAnalysis({ query: {...q, page_size: 100 }}),
          queryKey: JSON.stringify(q),
        })
      );
    },
    [dispatch]
  );

  const toggleColumn = React.useCallback(
    (id) => () => dispatch(toggleColumnVisibility(id)),
    [dispatch]
  );
  const checkColumnIsVisible = React.useCallback(
    (id) => view.hiddenColumns.indexOf(id) < 0,
    [view]
  );

  const canSelectColumn = React.useCallback(
    (columnName: string) => {
      return columnConfigs[columnName]?.approvable;
    },
    [columnConfigs]
  );

  const [ propFilters,  setPropFilters] = React.useState({} as PropFilter<AnalysisResult>);
  const [ rangeFilters,  setRangeFilters ] = React.useState({} as RangeFilter<AnalysisResult>);

  const onPropFilterChange = React.useCallback(
    (p: PropFilter<AnalysisResult>) => {
      setPropFilters({ ...propFilters, ...p });
    },
    [propFilters, setPropFilters]
  );

  const onRangeFilterChange = React.useCallback(
    (p: RangeFilter<AnalysisResult>) => {
      setRangeFilters({ ...rangeFilters, ...p });
    },
    [rangeFilters, setRangeFilters]
  );

  const composedFilter = React.useCallback((a) => predicateBuilder(propFilters, rangeFilters)(a), [propFilters, rangeFilters]);

  const filteredData = React.useMemo(() => data.filter(composedFilter), [composedFilter, data]);

  const approvableColumns = React.useMemo(
    () => [
      ...new Set(
        Object.values(columnConfigs || {})
          .map((c) => c?.approves_with)
          .reduce((a, b) => a.concat(b), [])
          .concat(
            Object.values(columnConfigs || {})
              .filter((c) => c?.approvable)
              .map((c) => c?.field_name)
          )
          .filter((x) => x !== undefined)
      ),
    ],
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

  const onNarrowHandler = React.useCallback(
    () =>
      setPageState({
        ...pageState,
        isNarrowed: !pageState.isNarrowed,
      }),
    [setPageState, pageState]
  );

  const approveSelection = React.useCallback(() => {
    setNeedsNotify(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    doApproval({ matrix: selection as any });
  }, [selection, doApproval, setNeedsNotify]);

  const rejectSelection = React.useCallback(() => {
    setNeedsNotify(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    doRejection({ matrix: selection as any });
  }, [selection, doRejection, setNeedsNotify]);

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
    <Box
      display="grid"
      gridTemplateRows="5% 5% minmax(0, 80%) 10%"
      gridTemplateColumns="300px auto"
      padding="8"
      height="100vh"
      gridGap="2"
    >
      <Box role="heading" gridColumn="1 / 4">
        <AnalysisHeader sidebarWidth={sidebarWidth} onSearch={onSearch} />
      </Box>
      <Box role="navigation" gridColumn="1 / 4">
        <Flex justifyContent="flex-end">
          <NavLink to="/approval-history">
            <Button leftIcon={<CalendarIcon />}>
              {t("My approval history")}
            </Button>
          </NavLink>
        </Flex>
      </Box>
      <Box role="form" gridColumn="1 / 2">
        <Box minW={sidebarWidth} pr={5}>
          <AnalysisSidebar
            data={filteredData}
            onPropFilterChange={onPropFilterChange}
            onRangeFilterChange={onRangeFilterChange}
          />
        </Box>
      </Box>
      <Box role="main" gridColumn="2 / 4" borderWidth="1px" rounded="md">
        <Box m={2}>
          <Button
            leftIcon={<DragHandleIcon />}
            margin="4px"
            onClick={onNarrowHandler}
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

          <ColumnConfigWidget>
            {columns.map((column) => (
              <div key={column.accessor as string} style={{ marginTop: "5px" }}>
                <input
                  type="checkbox"
                  checked={checkColumnIsVisible(column.accessor as string)}
                  onClick={toggleColumn(column.accessor)}
                />{" "}
                {column.accessor as string}
              </div>
            ))}
          </ColumnConfigWidget>
        </Box>

        <Box height="100%">
          <DataTable<AnalysisResult>
            columns={columns /* todo: filter on permission level */}
            canSelectColumn={canSelectColumn}
            canEditColumn={canEditColumn}
            canApproveColumn={canApproveColumn}
            approvableColumns={approvableColumns}
            getDependentColumns={getDependentColumns}
            data={
              pageState.isNarrowed
                ? filteredData.filter((x) => selection[x.isolate_id])
                : filteredData
            }
            primaryKey="isolate_id"
            selectionClassName={
              pageState.isNarrowed ? "approvingCell" : "selectedCell"
            }
            onSelect={(sel) => dispatch(setSelection(sel))}
            view={view}
          />
        </Box>
        <Box role="status" gridColumn="2 / 4">
          {isPending && `${t("Fetching...")} ${data.length}`}
          {isFinished &&
            !pageState.isNarrowed &&
            `${t("Found")} ${filteredData.length} ${t("records")}.`}
          {isFinished &&
            pageState.isNarrowed &&
            `${t("Staging")} ${
              filteredData.filter((x) => selection[x.isolate_id]).length
            } ${t("records")}.`}
        </Box>
      </Box>
    </Box>
  );
}
