import React, { useEffect, useState } from "react";
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
  Spinner,
} from "@chakra-ui/react";
import { CheckIcon, DragHandleIcon, NotAllowedIcon } from "@chakra-ui/icons";
import { Column, Row } from "react-table";
import {
  AnalysisResult,
  ApprovalRequest,
  AnalysisQuery,
  ApprovalStatus,
  Permission,
  Organization,
  HealthStatus,
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
import DataTable, {
  ColumnReordering,
  DataTableSelection,
} from "./data-table/data-table";
import {
  requestPageOfAnalysis,
  requestColumns,
  ColumnSlice,
  searchPageOfAnalysis,
  updateAnalysis,
  healthRequest,
  HealthSlice,
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
import { AnalysisResultAllOfQcFailedTests } from "sap-client/models/AnalysisResultAllOfQcFailedTests";

// When the fields in this array are 'approved', a given sequence is rendered
// as 'approved' also.
const PRIMARY_APPROVAL_FIELDS = ["st_final", "qc_final"];

type SelectionList = {
  [field: string]: boolean;
};

type SelectionType = {
  [sequence_id: string]: SelectionList;
};

type ErrorObject = {
  [sequence_id: string]: {
    [field: string]: string;
  };
};

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

  const [errors, setErrors] = React.useState<ErrorObject>();
  const [error, setError] = React.useState<boolean>();

  useRequest({ ...fetchApprovalMatrix() });
  // TODO: Figure out how to make this strongly typed
  const data = useSelector<RootState>((s) =>
    Object.values(s.entities.analysis ?? {})
  ) as AnalysisResult[];

  const totalCount = useSelector<RootState>((s) =>
    s.entities.analysisTotalCount !== 0
      ? s.entities.analysisTotalCount
      : Object.keys(s.entities.analysis).length
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
            sortType: !k.startsWith("date") ? 'alphanumeric' : (a, b, column) => {
              const aDate = a.original[column]?.getTime() ?? 0;
              const bDate = b.original[column]?.getTime() ?? 0;
              
              return aDate - bDate;
            },
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
  const health = useSelector<RootState>(
    (s) => s.entities.health
  ) as HealthSlice;
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

  useEffect(() => {
    dispatch(
      requestAsync({
        ...healthRequest("lims"),
      })
    );
    dispatch(
      requestAsync({
        ...healthRequest("tbr"),
      })
    );
  }, [dispatch]);

  useEffect(() => {
    const messages = [];
    if (health) {
      if (health.hasOwnProperty("lims") && health.hasOwnProperty("tbr")) {
        if (health["tbr"] && health["tbr"].status == HealthStatus.Unhealthy) {
          messages.push("Could not connect to TBR.");
        }
        if (health["lims"] && health["lims"].status == HealthStatus.Unhealthy) {
          messages.push("Could not connect to LIMS.");
        }
      }

      if (messages.length > 0) {
        const description = (
          <>
            {messages.map((message, index) => (
              <div key={index}>{message}</div>
            ))}
          </>
        );
        toast({
          title: "Error in service connection(s):",
          description,
          status: "warning",
          duration: null,
          isClosable: true,
        });
      }
    }
  }, [health, toast]);

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
      return (
        columnConfigs[columnName]?.approvable &&
        !columnConfigs[columnName]?.computed
      );
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

  const primaryApprovalColumns = React.useMemo(
    () =>
      Object.values(columnConfigs || {})
        .filter((c) => c?.approvable)
        .map((c) => c?.field_name as string),
    [columnConfigs]
  );

  const approvableColumns = React.useMemo(
    () => [
      ...new Set(
        Object.values(columnConfigs || {})
          .map((c) => c?.approves_with)
          .reduce((a, b) => a.concat(b), [])
          .concat(
            Object.values(columnConfigs || {})
              .filter((c) => c?.approvable)
              .filter((c) => !c?.computed)
              .map((c) => c?.field_name)
          )
          .filter((x) => x !== undefined)
      ),
    ],
    [columnConfigs]
  );

  const isPrimaryApprovalColumn = React.useCallback(
    (columnName: string) => {
      return primaryApprovalColumns.indexOf(columnName) >= 0;
    },
    [primaryApprovalColumns]
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
        return false;
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
      return (
        columnConfigs[columnName]?.editable &&
        !columnConfigs[columnName]?.computed
      );
    },
    [columnConfigs]
  );

  const getDependentColumns = React.useCallback(
    (columnName: keyof AnalysisResult) => {
      return (
        columnConfigs[columnName]?.approves_with ??
        ([] as Array<keyof AnalysisResult>)
      ).filter((x: keyof AnalysisResult) => !columnConfigs[x].computed);
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

  React.useEffect(() => {
    if (error) {
      const stringyfied = Object.entries(errors).reduceRight((acc, [k, v]) => {
        return Object.entries(v).reduceRight((accp, [kp, vp]) => {
          return (
            accp +
            `\n\tColumn '${kp}' needs ${vp} to be included in the selection.`
          );
        }, acc + `\nSequence '${k}': `);
      }, "");
      toast({
        title: t("Cannot approve when dependent fields are missing"),
        description: stringyfied,
        status: "error",
        duration: null,
        isClosable: true,
      });
      setNeedsApproveNotify(false);
    }
  }, [error, errors, toast, t]);

  /**
   * Check that every selected field does not "approve" with fields not present in selection.
   *
   * Some fields are "approved" with other fields. E.g., qc_final with species_final, run_id and sequence_id. In this
   * case if qc_final is in the selection, then the three other fields must also be in the selection. #104595
   * @param selection1 Selected columns from view
   */
  const approveSelection = React.useCallback(() => {
    setNeedsApproveNotify(true);

    const errorObject: ErrorObject = {};

    for (const [sequenceId, sequenceSelection] of Object.entries(selection)) {
      const approvedFields = Object.entries(sequenceSelection)
        .filter(([k, v], i) => v)
        .map(([k, v], i) => k);
      approvedFields.forEach((field) => {
        const needed = getDependentColumns(field as keyof AnalysisResult);
        for (const e of needed) {
          if (!approvedFields.some((x) => x === e)) {
            if (errorObject[sequenceId] === undefined) {
              errorObject[sequenceId] = {};
            }
            if (errorObject[sequenceId][field] === undefined) {
              errorObject[sequenceId][field] = `'${e}'`;
            } else {
              errorObject[sequenceId][field] += `, '${e}'`;
            }
          }
        }
      });
    }

    if (Object.keys(errorObject).length > 0) {
      setErrors(errorObject);
      setError(true);
    } else {
      doApproval({ matrix: selection as any });
    }
  }, [selection, doApproval, setNeedsApproveNotify, getDependentColumns]);

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
    (rowId: string, columnId: string, value: any, cell: any) => {
      if (
        value !== 0 &&
        value !== false &&
        !value &&
        !isPrimaryApprovalColumn(columnId)
      ) {
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
          // Some species require serotype to also be provided before the sequence can be considered 'approved'
          const species = Species.find(
            (x) => x["name"] === cell["species_final"]
          );
          if (
            species &&
            species["requires_serotype"] &&
            approvals[rowId]["serotype_final"] !== ApprovalStatus.approved
          ) {
            sequenceStyle = "unapprovedCell";
          }
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
    [approvals, canApproveColumn, isPrimaryApprovalColumn]
  );

  const getStickyCellStyle = React.useCallback(
    (rowId: string, rowData: any) => {
      const isNotLatestSequence =
        rowData.values.sequence_id !== rowData.values.latest_for_isolate;
      return `stickyCell ${isNotLatestSequence ? "isNotLatest" : ""}`;
    },
    []
  );

  const speciesNames = React.useMemo(() => Species.map((x) => x["name"]), []);

  const speciesOptions = React.useMemo(
    () => speciesNames.map((x) => ({ label: x, value: x })),
    [speciesNames]
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
      // any other dates
      else if (value instanceof Date) {
        // Fancy libraries could be used, but this will do the trick just fine
        v = value.toISOString().split("T")[0];
      } else if (
        (columnId.toLowerCase().startsWith("date") ||
          columnId.toLowerCase().endsWith("date")) &&
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
      } else if (typeof value === "object") {
        v = `${JSON.stringify(value)}`;
        if (columnId === "qc_failed_tests") {
          let acc = "";
          (value as Array<AnalysisResultAllOfQcFailedTests>).map((x) => {
            if (acc !== "") {
              acc += ", ";
            }
            acc += `${x.display_name}: ${x.reason}`;
          });
          v = acc;
        }
        if (columnId === "st_alleles") {
          let acc = "";
          Object.keys(value).map((k) => {
            if (acc !== "") {
              acc += ", ";
            }
            acc += `${k}: ${value[k]}`;
          });
          v = acc;
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
                ) : columnConfigs[columnId].editable_format === "number" ? (
                  <EditableInput
                    pattern="\d+"
                    type="numeric"
                    height="100%"
                    width="100%"
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
              selection={selection as DataTableSelection<AnalysisResult>}
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
