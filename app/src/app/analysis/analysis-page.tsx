import React, { useState } from "react";
import {
  Box,
  Flex,
  Button,
  useToast,
  Editable,
  EditablePreview,
  EditableInput,
  useDisclosure,
} from "@chakra-ui/react";
import { CheckIcon, DragHandleIcon, NotAllowedIcon } from "@chakra-ui/icons";
import { Column } from "react-table";
import {
  AnalysisResult,
  ApprovalRequest,
  AnalysisQuery,
  ApprovalStatus,
  Permission,
} from "sap-client";
import { useMutation, useRequest } from "redux-query-react";
import { useDispatch, useSelector } from "react-redux";
import { requestAsync } from "redux-query";
import { useTranslation } from "react-i18next";
import { OptionTypeBase } from "react-select";
import { UserDefinedViewInternal } from "models";
import { RootState } from "app/root-reducer";
import { predicateBuilder, PropFilter, RangeFilter } from "utils";
import { IfPermission } from "auth/if-permission";
import { Loading } from "loading";
import DataTable from "./data-table/data-table";
import {
  requestPageOfAnalysis,
  requestColumns,
  ColumnSlice,
  searchPageOfAnalysis,
  updateAnalysis,
} from "./analysis-query-configs";
import Header from "../header/header";
import AnalysisSidebar from "./sidebar/analysis-sidebar";
import AnalysisViewSelector from "./view-selector/analysis-view-selector";
import AnalysisSearch from "./search/analysis-search";
import { setSelection } from "./analysis-selection-configs";
import {
  fetchApprovalMatrix,
  sendApproval,
  sendRejection,
} from "./analysis-approval-configs";
import { ColumnConfigWidget } from "./data-table/column-config-widget";
import { toggleColumnVisibility } from "./view-selector/analysis-view-selection-config";
import InlineAutoComplete from "../inputs/inline-autocomplete";
import Species from "../data/species.json";
import Serotypes from "../data/serotypes.json";
import AnalysisDetails from "./analysis-details/analysis-details-modal";

export default function AnalysisPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const dispatch = useDispatch();

  const [moreInfoIsolate, setMoreInfoIsolate] = useState("");
  const {
    isOpen: isMoreInfoModalOpen,
    onOpen: onMoreInfoModalOpen,
    onClose: onMoreInfoModalClose,
  } = useDisclosure();

  const [columnLoadState] = useRequest(requestColumns());
  const [{ isPending, isFinished }] = useRequest({
    ...requestPageOfAnalysis({ pageSize: 1000 }),
  });

  useRequest({ ...fetchApprovalMatrix() });
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

  const [
    { isPending: pendingUpdate, status: updateStatus },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _submitChange,
  ] = useMutation((payload: { [K: string]: { [K: string]: string } }) =>
    updateAnalysis(payload)
  );

  const [lastUpdatedRow, setLastUpdatedRow] = React.useState(null);

  const submitChange = React.useCallback(
    (payload: { [K: string]: { [K: string]: string } }) => {
      setLastUpdatedRow(Object.keys(payload)[0]);
      _submitChange(payload);
    },
    [_submitChange, setLastUpdatedRow]
  );

  const selection = useSelector<RootState>((s) => s.selection.selection);
  const approvals = useSelector<RootState>((s) => s.entities.approvalMatrix);
  const view = useSelector<RootState>(
    (s) => s.view.view
  ) as UserDefinedViewInternal;

  const onSearch = React.useCallback(
    (q: AnalysisQuery) => {
      dispatch({ type: "RESET/Analysis" });
      // if we got an empty expression, just request a page
      if (q.expression && Object.keys(q.expression).length === 0) {
        dispatch(
          requestAsync({
            ...requestPageOfAnalysis({ pageSize: 1000 }),
          })
        );
      } else {
        dispatch(
          requestAsync({
            ...searchPageOfAnalysis({ query: { ...q, page_size: 100 } }),
            queryKey: JSON.stringify(q),
          })
        );
      }
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

  const [propFilters, setPropFilters] = React.useState(
    {} as PropFilter<AnalysisResult>
  );
  const [rangeFilters, setRangeFilters] = React.useState(
    {} as RangeFilter<AnalysisResult>
  );

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

  const composedFilter = React.useCallback(
    (a) => predicateBuilder(propFilters, rangeFilters)(a),
    [propFilters, rangeFilters]
  );

  const filteredData = React.useMemo(() => data.filter(composedFilter), [
    composedFilter,
    data,
  ]);

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

  const [needsApproveNotify, setNeedsApproveNotify] = useState(true);
  const [needsRejectNotify, setNeedsRejectNotify] = useState(true);

  const onNarrowHandler = React.useCallback(
    () =>
      setPageState({
        ...pageState,
        isNarrowed: !pageState.isNarrowed,
      }),
    [setPageState, pageState]
  );

  const approveSelection = React.useCallback(() => {
    setNeedsApproveNotify(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    doApproval({ matrix: selection as any });
  }, [selection, doApproval, setNeedsApproveNotify]);

  const rejectSelection = React.useCallback(() => {
    setNeedsRejectNotify(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    doRejection({ matrix: selection as any });
  }, [selection, doRejection, setNeedsRejectNotify]);

  // Display approval toasts
  React.useMemo(() => {
    if (
      needsApproveNotify &&
      approvalStatus >= 200 &&
      approvalStatus < 300 &&
      !pendingApproval
    ) {
      toast({
        title: t("Approval submitted"),
        description: `${
          data.filter((x) => selection[x.sequence_id]).length
        } ${t("records")} ${t("have been submitted for approval.")}`,
        status: "info",
        duration: 5000,
        isClosable: true,
      });
      setNeedsApproveNotify(false);
    }
  }, [
    t,
    approvalStatus,
    data,
    selection,
    toast,
    needsApproveNotify,
    pendingApproval,
  ]);

  // Display rejection toasts
  React.useMemo(() => {
    if (
      needsRejectNotify &&
      rejectionStatus >= 200 &&
      rejectionStatus < 300 &&
      !pendingRejection
    ) {
      toast({
        title: t("Rejection submitted"),
        description: `${
          data.filter((x) => selection[x.sequence_id]).length
        } ${t("records")} ${t("have been rejected.")}`,
        status: "info",
        duration: null,
        isClosable: true,
      });
      setNeedsRejectNotify(false);
    }
  }, [
    t,
    rejectionStatus,
    data,
    selection,
    toast,
    needsRejectNotify,
    pendingRejection,
  ]);

  const getCellStyle = React.useCallback(
    (rowId: string, columnId: string) => {
      if (!canApproveColumn(columnId)) {
        return "cell";
      }
      if (
        approvals &&
        approvals[rowId] &&
        approvals[rowId][columnId] === ApprovalStatus.approved
      ) {
        return "cell";
      }
      if (
        approvals &&
        approvals[rowId] &&
        approvals[rowId][columnId] === ApprovalStatus.rejected
      ) {
        return "rejectedCell";
      }
      return "unapprovedCell";
    },
    [approvals, canApproveColumn]
  );

  const getStickyCellStyle = React.useCallback(
    (rowId: string) => {
      const approvedCells = Object.keys(approvals[rowId] || {}).length;
      return approvableColumns.length - approvedCells >= 5
        ? "unapprovedCell stickyCell"
        : "stickyCell";
    },
    [approvals, approvableColumns]
  );

  const speciesOptions = React.useMemo(
    () => Species.map((x) => ({ label: x, value: x })),
    []
  );

  const serotypeOptions = React.useMemo(
    () => Serotypes.map((x) => ({ label: x, value: x })),
    []
  );

  const rowUpdating = React.useCallback(
    (id) => {
      return id === lastUpdatedRow && pendingUpdate;
    },
    [lastUpdatedRow, pendingUpdate]
  );

  const onAutocompleteEdit = React.useCallback(
    (rowId: string, field: string) => (val: string | OptionTypeBase) => {
      submitChange({ [rowId]: { [field]: (val as any).value } });
    },
    [submitChange]
  );

  const onFreeTextEdit = React.useCallback(
    (rowId: string, field: string) => (val: string) => {
      submitChange({ [rowId]: { [field]: val } });
    },
    [submitChange]
  );

  const renderCellControl = React.useCallback(
    (rowId: string, columnId: string, value: any) => {
      let v = `${value}`;
      if (
        columnId.endsWith("date") &&
        value !== undefined &&
        !Number.isNaN(value.getTime())
      ) {
        v = value.toISOString();
      }
      // cannot edit cells that have already been approved
      if (approvals?.[rowId]?.[columnId] !== ApprovalStatus.approved) {
        if (columnId === "species_final") {
          return (
            <InlineAutoComplete
              options={speciesOptions}
              onChange={onAutocompleteEdit(rowId, columnId)}
              defaultValue={v}
              isLoading={rowUpdating(rowId)}
            />
          );
        }
        if (columnId === "serotype_final") {
          return (
            <InlineAutoComplete
              options={serotypeOptions}
              onChange={onAutocompleteEdit(rowId, columnId)}
              defaultValue={v}
              isLoading={rowUpdating(rowId)}
            />
          );
        }
        if (columnConfigs[columnId].editable) {
          return (
            <Editable
              defaultValue={v}
              onSubmit={onFreeTextEdit(rowId, columnId)}
            >
              <EditablePreview />
              <EditableInput />
            </Editable>
          );
        }
      }
      return <div>{`${v}`}</div>;
    },
    [
      columnConfigs,
      speciesOptions,
      serotypeOptions,
      onAutocompleteEdit,
      onFreeTextEdit,
      rowUpdating,
      approvals,
    ]
  );

  const openDetailsView = React.useCallback(
    (primaryKey: any) => {
      setMoreInfoIsolate(primaryKey);
      onMoreInfoModalOpen();
    },
    [setMoreInfoIsolate, onMoreInfoModalOpen]
  );

  const sidebarWidth = "300px";
  if (!columnLoadState.isFinished) {
    <Loading />;
  }

  return (
    <React.Fragment>
      <AnalysisDetails
        isolateId={moreInfoIsolate}
        isOpen={isMoreInfoModalOpen}
        onClose={onMoreInfoModalClose}
      />
      <Box
        display="grid"
        gridTemplateRows="5% 5% minmax(0, 80%) 10%"
        gridTemplateColumns="300px auto"
        padding="8"
        height="100vh"
        gridGap="2"
        rowgap="5"
      >
        <Box role="heading" gridColumn="1 / 4">
          <Header sidebarWidth={sidebarWidth} />
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
        <Box role="navigation" gridColumn="2 / 4" pb={5}>
          <Flex justifyContent="flex-end">
            <AnalysisSearch onSubmit={onSearch} />
            <Box minW="250px" ml="5">
              <AnalysisViewSelector />
            </Box>
          </Flex>
        </Box>
        <Box role="main" gridColumn="2 / 4" borderWidth="1px" rounded="md">
          <Box m={2}>
            <IfPermission permission={Permission.approve}>
              <Button
                leftIcon={<DragHandleIcon />}
                margin="4px"
                onClick={onNarrowHandler}
              >
                {pageState.isNarrowed ? t("Return") : t("Select")}
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
            </IfPermission>

            <ColumnConfigWidget>
              {columns.map((column) => (
                <div
                  key={column.accessor as string}
                  style={{ marginTop: "5px" }}
                >
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
              columns={columns || []}
              canSelectColumn={canSelectColumn}
              canEditColumn={canEditColumn}
              canApproveColumn={canApproveColumn}
              approvableColumns={approvableColumns}
              getDependentColumns={getDependentColumns}
              getCellStyle={getCellStyle}
              getStickyCellStyle={getStickyCellStyle}
              data={
                pageState.isNarrowed
                  ? filteredData.filter((x) => selection[x.sequence_id])
                  : filteredData
              }
              renderCellControl={renderCellControl}
              primaryKey="sequence_id"
              selectionClassName={
                pageState.isNarrowed ? "approvingCell" : "selectedCell"
              }
              onSelect={(sel) => dispatch(setSelection(sel))}
              onDetailsClick={openDetailsView}
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
                filteredData.filter((x) => selection[x.sequence_id]).length
              } ${t("records")}.`}
          </Box>
        </Box>
      </Box>
    </React.Fragment>
  );
}
