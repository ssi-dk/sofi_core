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
  Skeleton,
  Divider,
  Spinner,
} from "@chakra-ui/react";
import { CheckIcon, DragHandleIcon, NotAllowedIcon } from "@chakra-ui/icons";
import { Column, Row, TableState } from "react-table";
import {
  AnalysisResult,
  ApprovalRequest,
  AnalysisQuery,
  ApprovalStatus,
  Permission,
  Organization,
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
import DataTable, { ColumnReordering } from "./data-table/data-table";
import {
  requestPageOfAnalysis,
  requestColumns,
  ColumnSlice,
  searchPageOfAnalysis,
  updateAnalysis,
} from "./analysis-query-configs";
import HalfHolyGrailLayout from "../../layouts/half-holy-grail";
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
import ExportButton from "./export/export-button";
import { ColumnConfigNode } from "./data-table/column-config-node";
import SearchHelpModal from "./search/search-help-modal";

// When the fields in this array are 'approved', a given sequence is rendered
// as 'approved' also.
const PRIMARY_APPROVAL_FIELDS = ["st_final", "qc_final", "serotype_final"];

export default function AnalysisPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const dispatch = useDispatch();

  const [moreInfoIsolate, setMoreInfoIsolate] = useState("");
  const [moreInfoIsolateInstitution, setMoreInfoIsolateInstitution] = useState(
    Organization.Other
  );
  const {
    isOpen: isMoreInfoModalOpen,
    onOpen: onMoreInfoModalOpen,
    onClose: onMoreInfoModalClose,
  } = useDisclosure();

  const [columnLoadState] = useRequest(requestColumns());
  const [{ isPending, isFinished }] = useRequest({
    ...requestPageOfAnalysis({ pageSize: 100 }, false),
  });

  useRequest({ ...fetchApprovalMatrix() });
  // TODO: Figure out how to make this strongly typed
  const data = useSelector<RootState>((s) =>
    Object.values(s.entities.analysis ?? {})
  ) as AnalysisResult[];

  const totalCount = useSelector<RootState>(
    (s) => s.entities.analysisTotalCount
  ) as number;

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

  const approvalErrors = useSelector<RootState>(
    (s) => s.entities.approvalErrors
  ) as Array<string>;

  const [
    { isPending: pendingUpdate, status: updateStatus },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _submitChange,
  ] = useMutation((payload: { [K: string]: { [K: string]: string } }) =>
    updateAnalysis(payload)
  );

  const [lastUpdatedRow, setLastUpdatedRow] = React.useState(null);
  const [lastUpdatedColumns, setLastUpdatedColumns] = React.useState([]);

  const submitChange = React.useCallback(
    (payload: { [K: string]: { [K: string]: string } }) => {
      setLastUpdatedRow(Object.keys(payload)[0]);
      setLastUpdatedColumns(Object.keys(payload[Object.keys(payload)[0]]));
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
            ...requestPageOfAnalysis({ pageSize: 100 }, false),
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

  const { hiddenColumns } = view;

  const toggleColumn = React.useCallback(
    (id) => dispatch(toggleColumnVisibility(id)),
    [dispatch]
  );

  const checkColumnIsVisible = React.useCallback(
    (id) => hiddenColumns.indexOf(id) < 0,
    [hiddenColumns]
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

  const isJudgedCell = React.useCallback(
    (rowId: string, columnName: string) => {
      if (!approvals[rowId]) {
        return true;
      }
      return (
        approvals[rowId][columnName] == ApprovalStatus.approved ||
        approvals[rowId][columnName] == ApprovalStatus.rejected
      );
    },
    [approvals]
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
        duration: 3000,
        isClosable: true,
      });
      if (approvalErrors?.length > 0) {
        approvalErrors.forEach((e) => {
          toast({
            title: t("An approval failed"),
            description: e,
            status: "error",
            duration: null,
            isClosable: true,
          });
        });
      }
      setNeedsApproveNotify(false);
    }
  }, [
    t,
    approvalErrors,
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
    (rowId: string, columnId: string, value: any) => {
      if (value !== 0 && value !== false && !value) {
        return "emptyCell";
      }
      if (`${value}` === "Invalid Date") {
        return "emptyCell";
      }
      if (!canApproveColumn(columnId)) {
        return "cell";
      }
      if (approvals && approvals[rowId]) {
        // sequence_id changes color depending on if specific fields are approved
        if (columnId === "sequence_id") {
          let sequenceStyle = "cell";
          PRIMARY_APPROVAL_FIELDS.forEach((f) => {
            if (approvals[rowId][f] !== ApprovalStatus.approved)
              sequenceStyle = "unapprovedCell";
          });
          return sequenceStyle;
        }
        if (approvals[rowId][columnId] === ApprovalStatus.approved) {
          return "cell";
        }
        if (approvals[rowId][columnId] === ApprovalStatus.rejected) {
          return "rejectedCell";
        }
      }
      return "unapprovedCell";
    },
    [approvals, canApproveColumn]
  );

  const getStickyCellStyle = React.useCallback(
    (rowId: string, rowData: any) => {
      const isLatestSequence =
        rowData.values.sequence_id === rowData.values.latest_for_isolate;
      return `stickyCell ${isLatestSequence ? "isLatest" : ""}`;
    },
    []
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

  const cellUpdating = React.useCallback(
    (id, column) => {
      const updating =
        id === lastUpdatedRow &&
        lastUpdatedColumns.indexOf(column) >= 0 &&
        pendingUpdate;
      return updating;
    },
    [lastUpdatedRow, lastUpdatedColumns, pendingUpdate]
  );

  const onAutocompleteEdit = React.useCallback(
    (rowId: string, field: string) => (val: string | OptionTypeBase) => {
      submitChange({ [rowId]: { [field]: (val as any).value } });
    },
    [submitChange]
  );

  const onFreeTextEdit = React.useCallback(
    (rowId: string, field: string) => (val: string) => {
      if (columnConfigs[field].editable_format === "date") {
        if (val.match(/\d{4}-\d{1,2}-\d{1,2}/) != null) {
          submitChange({ [rowId]: { [field]: val } });
        }
      } else {
        submitChange({ [rowId]: { [field]: val } });
      }
    },
    [columnConfigs, submitChange]
  );

  const renderCellControl = React.useCallback(
    (rowId: string, columnId: string, value: any) => {
      if (cellUpdating(rowId, columnId)) {
        return <Skeleton width="100px" height="20px" />;
      }
      if (
        value !== 0 &&
        value !== false &&
        !value &&
        !columnConfigs[columnId].editable
      ) {
        return <div />;
      }
      let v = `${value}`;
      if (v === "Invalid Date") {
        return <div />;
      }
      if (
        (columnId.startsWith("date") || columnId.endsWith("date")) &&
        value !== undefined
      ) {
        if (
          typeof value?.getTime === "function" &&
          !Number.isNaN(value?.getTime())
        ) {
          v = value?.toISOString()?.split("T")[0];
        } else {
          v = value?.split("T")[0];
        }
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
            <Box minWidth="100%" minHeight="100%">
              <Editable
                minW="100%"
                minH="100%"
                defaultValue={value || value === 0 ? v : ""}
                submitOnBlur={false}
                onSubmit={onFreeTextEdit(rowId, columnId)}
              >
                <EditablePreview
                  height="100%"
                  minWidth="400px"
                  minHeight="22px"
                />
                {columnConfigs[columnId].editable_format === "date" ? (
                  <EditableInput
                    pattern="\d{4}-\d{1,2}-\d{1,2}"
                    title="Date in yyyy-mm-dd format"
                    height="100%"
                    minWidth="100%"
                  />
                ) : (
                  <EditableInput height="100%" width="100%" />
                )}
              </Editable>
              <hr />
            </Box>
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
      cellUpdating,
      approvals,
    ]
  );

  const openDetailsView = React.useCallback(
    (primaryKey: string, row: Row<AnalysisResult>) => {
      setMoreInfoIsolate(row.original.isolate_id);
      setMoreInfoIsolateInstitution(row.original.institution);
      onMoreInfoModalOpen();
    },
    [setMoreInfoIsolate, onMoreInfoModalOpen]
  );

  if (!columnLoadState.isFinished) {
    <Loading />;
  }

  const [columnOrder, setColumnOrder] = React.useState(undefined);
  const [columnReorder, setColumnReorder] = React.useState(
    undefined as ColumnReordering
  );

  const [columnSort, setColumnSort] = React.useState(undefined);

  const onReorderColumn = React.useCallback(
    (sourceIdx: number, destIdx: number, draggableId: string) => {
      setColumnReorder({
        sourceIdx,
        destIdx,
        targetId: draggableId,
        timestamp: Date.now(),
      });
    },
    [setColumnReorder]
  );

  const content = (
    <React.Fragment>
      <Box role="navigation" gridColumn="2 / 4" pb={5}>
        <Flex justifyContent="flex-end">
          <AnalysisSearch onSubmit={onSearch} />
          <Box minW="250px" ml="5">
            <AnalysisViewSelector />
          </Box>
        </Flex>
      </Box>
      <Box role="main" gridColumn="2 / 4" borderWidth="1px" rounded="md">
        {pendingApproval ? (
          <Flex m={2} alignItems="center">
            <Spinner />
          </Flex>
        ) : (
          <Flex m={2} alignItems="center">
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
            <ColumnConfigWidget onReorder={onReorderColumn}>
              {(columnOrder || columns.map((x) => x.accessor as string)).map(
                (column, i) => (
                  <ColumnConfigNode
                    key={column}
                    index={i}
                    columnName={column}
                    onChecked={toggleColumn}
                    isChecked={checkColumnIsVisible(column)}
                  />
                )
              )}
            </ColumnConfigWidget>
            <Flex grow={1} width="100%" />
            <ExportButton
              data={filteredData}
              columns={columns.map((x) => x.accessor) as any}
            />
          </Flex>
        )}

        <Box height="calc(100vh - 250px)">
          <DataTable<AnalysisResult>
            columns={columns || []}
            columnReordering={columnReorder}
            columnSort={columnSort}
            setNewColumnOrder={setColumnOrder}
            setColumnSort={setColumnSort}
            canSelectColumn={canSelectColumn}
            canEditColumn={canEditColumn}
            canApproveColumn={canApproveColumn}
            isJudgedCell={isJudgedCell}
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
            `${t("Showing")} ${filteredData.length} ${t(
              "of"
            )} ${totalCount} ${t("records")}.`}
          {isFinished &&
            pageState.isNarrowed &&
            `${t("Staging")} ${
              filteredData.filter((x) => selection[x.sequence_id]).length
            } ${t("records")}.`}
        </Box>
      </Box>
    </React.Fragment>
  );

  return (
    <React.Fragment>
      <AnalysisDetails
        institution={moreInfoIsolateInstitution}
        isolateId={moreInfoIsolate}
        isOpen={isMoreInfoModalOpen}
        onClose={onMoreInfoModalClose}
      />
      <HalfHolyGrailLayout
        sidebar={
          <AnalysisSidebar
            data={filteredData}
            onPropFilterChange={onPropFilterChange}
            onRangeFilterChange={onRangeFilterChange}
          />
        }
        content={content}
      />
    </React.Fragment>
  );
}
