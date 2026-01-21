import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Box,
  Flex,
  Editable,
  EditablePreview,
  EditableInput,
  Skeleton,
  useToast,
  Button,
  IconButton,
  Menu, 
  MenuList, 
  MenuButton, 
  MenuItem,
  Input
} from "@chakra-ui/react";
import { HamburgerIcon, AddIcon, EditIcon, DeleteIcon, CheckIcon } from "@chakra-ui/icons";

import { Column, Row } from "react-table";
import {
  AnalysisResult,
  AnalysisQuery,
  ApprovalStatus,
  UserInfo,
  QueryExpression,
  QueryOperator,
  QueryOperand,
  FilterOptions,
  AnalysisSorting,
  Workspace,
} from "sap-client";
import { useMutation, useRequest } from "redux-query-react";
import { useDispatch, useSelector } from "react-redux";
import { requestAsync } from "redux-query";
import { useTranslation } from "react-i18next";
import { OptionTypeBase } from "react-select";
import { UserDefinedViewInternal } from "models";
import { RootState } from "app/root-reducer";
import { PropFilter, RangeFilter } from "utils";
import { Loading } from "loading";
import { fetchWorkspaces,createWorkspace, updateWorkspace, removeWorkspaceSamples } from "../workspaces/workspaces-query-configs";
import { SendToMicroreactButton } from "../workspaces/send-to-microreact-button";
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
} from "./analysis-query-configs";
import HalfHolyGrailLayout from "../../layouts/half-holy-grail";
import AnalysisSidebar from "./sidebar/analysis-sidebar";
import { AnalysisViewSelector } from "./view-selector/analysis-view-selector";
import AnalysisSearch from "./search/analysis-search";
import { setSelection } from "./analysis-selection-configs";
import { fetchApprovalMatrix } from "./analysis-approval-configs";
import { ColumnConfigWidget } from "./data-table/column-config-widget";
import { toggleColumnVisibility } from "./view-selector/analysis-view-selection-config";
import InlineAutoComplete from "../inputs/inline-autocomplete";
import Species from "../data/species.json";
import Serotypes from "../data/serotypes.json";
import { AnalysisDetailsModal } from "./analysis-details/analysis-details-modal";
import ExportButton from "./export/export-button";
import { ColumnConfigNode } from "./data-table/column-config-node";
import { AnalysisResultAllOfQcFailedTests } from "sap-client/models/AnalysisResultAllOfQcFailedTests";
import { Judgement } from "./judgement/judgement";
import { Health } from "./health/health";
import { Debug } from "./debug";
import { AnalysisSelectionMenu } from "./analysis-selection-menu";
import { CellConfirmModal } from "./data-table/cell-confirm-modal";
import {
  appendToSearchHistory,
  buildQueryFromFilters,
  checkExpressionEquality,
  checkSortEquality,
  recurseSearchTree,
} from "./search/search-utils";
import {WorkspaceMenu} from "./workspace-menu"
import { svgElements } from "framer-motion/types/render/svg/supported-elements";

// When the fields in this array are 'approved', a given sequence is rendered
// as 'approved' also.
const PRIMARY_APPROVAL_FIELDS = ["st_final", "qc_final"];

export type SearchQuery = AnalysisQuery & { clearAllFields?: boolean };

let prevSearchTerms: Set<string> = new Set(); // NEEDS to be outside the react component to prevent un-needed rerender

export default function AnalysisPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const toast = useToast();

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [workspacesQueryState] = useRequest(fetchWorkspaces());
  const workspaces = useSelector<RootState>((s) =>
      Object.values(s.entities.workspaces ?? {})
  ) as Array<Workspace>;




  const [workspaceCreationState, sendToWorkspace] = useMutation((name: string) => {
      return createWorkspace({
        name,
        samples: workspace.samples,
      });
    }
  );
  const [workspaceAddState, addToWorkspace] = useMutation(
    (workspaceId: string) => {
      const samples = Object.values(selection).map((s) => s.original.id);

      return updateWorkspace({
        workspaceId,
        updateWorkspace: { samples },
      });
    }
  );
  const [workspaceRemoveState, removeFromWorkspace] = useMutation(
    (workspaceId: string) => {
      const samples = Object.values(selection).map((s) => s.original.id);

      return removeWorkspaceSamples({
        workspaceId,
        updateWorkspace: { samples },
      });
    }
  );

  useEffect(() => {
    if (workspace) {
      const maybeUpdatedWorkspace = workspaces.find(ws => ws.id === workspace.id);
      
      // Does not exist in temp workspaces, so null check is needed
      if (maybeUpdatedWorkspace) {
        if (maybeUpdatedWorkspace.samples !== workspace.samples) {
          setWorkspace(maybeUpdatedWorkspace);
        }
      }
    }
  },[workspaces, workspace])

  useEffect(() => {
    if (workspaceCreationState.status === 200) {
      setWorkspace(workspaces[workspaces.length - 1]);
    }
  },[workspaceCreationState])

  const [currentPage, setCurrentPage] = useState(0);
  const [isLoadingNextPage, setIsLoadingNextPage] = useState(false);
  const isLoadingRef = useRef(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const nextPageTokenRef = useRef<string | null>(null);
  const currentPageRef = useRef(0);
  const [isModalOpen, setModalOpen] = useState(false);
  const [prevColumnSort, setPrevColumnSort] = React.useState<
    AnalysisSorting & { column: string; ascending: boolean }
  >(undefined);
  const [columnSort, setColumnSort] = React.useState<
    AnalysisSorting & { column: string; ascending: boolean }
  >(undefined);
  const [modalInfo, setModalInfo] = useState({
    rowId: "",
    columnId: "",
    value: "",
  });

  const [detailsIsolate, setDetailsIsolate] = useState<
    React.ComponentProps<typeof AnalysisDetailsModal>["isolate"]
  >();
  const onAnalysisDetailsModalClose = useCallback(() => {
    setDetailsIsolate(undefined);
  }, []);

  const PAGE_SIZE = 100;

  const [columnLoadState] = useRequest(requestColumns());
  const [{ isPending, isFinished }] = useRequest({
    ...requestPageOfAnalysis({ pageSize: PAGE_SIZE }, false),
  });

  const user = useSelector<RootState>((s) => s.entities.user ?? {}) as UserInfo;

  useRequest({ ...fetchApprovalMatrix() });

  const rootStateData = useSelector<RootState>((s) => s.entities.analysis);

  const filterOptions = (useSelector<RootState>(
    (s) => s.entities.filterOptions
  ) as FilterOptions) || {
    date_sample: { min: null, max: null },
    date_received: { min: null, max: null },
    institutions: [],
    project_titles: [],
    project_numbers: [],
    animals: [],
    run_ids: [],
    isolate_ids: [],
    fud_nos: [],
    cluster_ids: [],
    qc_provided_species: [],
    serotype_finals: [],
    st_finals: [],
  };

  const totalCount = useSelector<RootState>((s) =>
    s.entities.analysisTotalCount !== 0
      ? s.entities.analysisTotalCount
      : Object.keys(s.entities.analysis).length
  ) as number;

  const data = React.useMemo(() => {
    return Object.values(rootStateData ?? {}) as AnalysisResult[];
  }, [rootStateData]);

  const currentPagingToken = useSelector<RootState>(
    (s) => s.entities.analysisPagingToken
  ) as string;

  // Update hasMoreData to check if we have a paging token
  const hasMoreData = useMemo(() => {
    return (
      data.length < totalCount &&
      currentPagingToken !== null &&
      currentPagingToken !== undefined
    );
  }, [data.length, totalCount, currentPagingToken]);

  // Keep a ref for immediate access in async operations
  const hasMoreDataRef = useRef(hasMoreData);
  // Update the ref when hasMoreData changes
  useEffect(() => {
    hasMoreDataRef.current = hasMoreData;
  }, [hasMoreData]);

  // Update nextPageTokenRef when currentPagingToken changes
  useEffect(() => {
    nextPageTokenRef.current = currentPagingToken;
    setNextPageToken(currentPagingToken);
  }, [currentPagingToken]);

  useEffect(() => {
    isLoadingRef.current = isLoadingNextPage;
  }, [isLoadingNextPage]);

  const searchTerms = useMemo(() => {
    const current = new Set(data.flatMap(Object.keys));
    prevSearchTerms = new Set(...prevSearchTerms, ...current);
    return prevSearchTerms;
  }, [data]);

  const columnConfigs = useSelector<RootState>(
    (s) => s.entities.columns
  ) as ColumnSlice;

  const columns = React.useMemo(
    () =>
      Object.keys(columnConfigs || []).map(
        (k) =>
          ({
            accessor: k,
            sortType: !k.startsWith("date")
              ? "alphanumeric"
              : (a, b, column) => {
                  const enforceDate = (d: Date | string | undefined) => {
                    if (typeof d == "string") {
                      return new Date(d)
                    }
                    return d;
                  }
                  const aDate = enforceDate(a.original[column])?.getTime() ?? 0;
                  const bDate = enforceDate(b.original[column])?.getTime() ?? 0;

                  return aDate - bDate;
                },
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

  useEffect(() => {
    if (updateStatus === 403) {
      toast({
        title: "Failed to edit isolate - Forbidden",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [updateStatus, toast]);

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

  const selection = useSelector<RootState>((s) => 
      s.selection.selection as DataTableSelection<AnalysisResult>
  ) as DataTableSelection<AnalysisResult>;

  const approvals = useSelector<RootState>((s) => s.entities.approvalMatrix);
  const view = useSelector<RootState>(
    (s) => s.view.view
  ) as UserDefinedViewInternal;

  const displayData = useMemo(() => {
    const selectionValues = Object.values(selection).map(v => v.original)

    if (pageState.isNarrowed) {
      return selectionValues
    } 

    if (workspace) {
      return[
        ...selectionValues.filter(sv => !workspace.samples!.find(sid => sid == sv.id)),
        ...data.filter(d => workspace.samples!.find( s => s === d.id) ),
      ]
    }

    return[
      ...selectionValues.filter(sv => !data.find(d => d.sequence_id == sv.sequence_id)),
      ...data,
    ]
  }, [selection, data,pageState.isNarrowed, workspace]);

  const [lastSearchQuery, setLastSearchQuery] = useState<AnalysisQuery>({
    expression: {},
  });
  const [lastSearchWs, setLastSearchWs] = useState<Workspace | null>(null);
  const lastQueryOperands = useMemo(() => {
    return recurseSearchTree(lastSearchQuery.expression);
  }, [lastSearchQuery]);

  const [rawSearchQuery, setRawSearchQuery] = useState<SearchQuery>({
    expression: {},
  });

  const [propFilters, setPropFilters] = React.useState(
    {} as PropFilter<AnalysisResult>
  );
  const [rangeFilters, setRangeFilters] = React.useState(
    {} as RangeFilter<AnalysisResult>
  );
  const [approvalFilters, setApprovalFilters] = React.useState<ApprovalStatus[]>([]);

  const clearFieldFromSearch = useCallback( (field: string) => {
    const recurseAndModify = (
      ex?: QueryExpression | QueryOperand
    ): QueryExpression => {
      if (!ex) {
        return undefined;
      }
      if ("field" in ex) {
        if (ex.field == field) {
          return undefined;
        }
        return { ...ex };
      }

    
      const left = recurseAndModify(ex.left);
      const right = recurseAndModify(ex.right);

      if (!left && !right) {
        return undefined;
      } else if (!left) {
        return right;
      } else if (!right) {
        return left;
      } else {
        return { ...ex, left, right };
      }
    };

    // Also clear from prop filters
    setPropFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[field];
      return newFilters;
    });

    // Also clear from range filters
    setRangeFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[field];
      return newFilters;
    });

    if (field == "approval_status") {
      setApprovalFilters([]);
    }

    setRawSearchQuery((old) => ({
      expression: recurseAndModify(old.expression),
    }));
  },[setPropFilters, setRangeFilters, setRawSearchQuery, setApprovalFilters]);

  useEffect(() => {
    isLoadingRef.current = isLoadingNextPage;
  }, [isLoadingNextPage]);

  useEffect(() => {
    hasMoreDataRef.current = hasMoreData;
  }, [hasMoreData]);

  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  const loadNextPage = useCallback(async () => {
    // Use refs for immediate state check to prevent race conditions
    if (
      isLoadingRef.current ||
      !hasMoreDataRef.current ||
      isPending ||
      !nextPageTokenRef.current
    ) {
      return;
    }

    // Set loading state immediately
    isLoadingRef.current = true;
    setIsLoadingNextPage(true);


    try {
      const requestConfig = requestPageOfAnalysis(
        {
          pagingToken: nextPageTokenRef.current,
        },
        true
      );
      dispatch(requestAsync(requestConfig));
    } catch (error) {
      console.error("Error loading next page:", error);
      toast({
        title: "Error loading more results",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoadingNextPage(false);
      isLoadingRef.current = false;
    }
  }, [isPending, dispatch, toast]);

  const onSearch = React.useCallback(
    (q: SearchQuery, pageSize: number) => {
      const mergeFilters = (
        searchExpression: QueryExpression,
        propFilter: PropFilter<AnalysisResult>,
        rangeFilter: RangeFilter<AnalysisResult>,
        approvalFilter: ApprovalStatus[],
      ) => {
        const filterExpression = buildQueryFromFilters(propFilter, rangeFilter, approvalFilter);
        searchExpression = Object.fromEntries(
          Object.entries(searchExpression).filter(([_, v]) => !!v)
        ) as QueryExpression;

        if (
          searchExpression &&
          Object.keys(searchExpression).length > 0 &&
          filterExpression
        ) {
          return {
            operator: QueryOperator.AND,
            left: searchExpression.operator
              ? searchExpression
              : searchExpression.left,
            right: filterExpression.operator
              ? filterExpression
              : filterExpression.left,
          };
        } else if (filterExpression) {
          return filterExpression;
        } else if (
          searchExpression &&
          Object.keys(searchExpression).length > 0
        ) {
          return searchExpression;
        } else {
          return {};
        }
      };

      const newExpression = q.clearAllFields
        ? q.expression
        : mergeFilters(q.expression || {}, propFilters, rangeFilters, approvalFilters);
      if (
        checkExpressionEquality(newExpression, lastSearchQuery.expression) &&
        checkSortEquality(columnSort, prevColumnSort) && lastSearchWs === workspace
      ) {
        return;
      }
      setPrevColumnSort(columnSort);

      // Reset pagination state when starting a new search
      setIsLoadingNextPage(false);
      setNextPageToken(null);

      // Update refs immediately
      nextPageTokenRef.current = null;
      isLoadingRef.current = false;

      // ...rest of existing onSearch logic remains the same...

      if (q.clearAllFields) {
        setPropFilters({});
        setRangeFilters({});
        setApprovalFilters([]);
      }
      const newQ = { expression: newExpression };

      dispatch({ type: "RESET/Analysis" });
      setLastSearchQuery(newQ);
      setLastSearchWs(workspace);
      appendToSearchHistory(newExpression);

      const searchingWithWs = workspace && workspace.id != "temp-workspace";


      if (newExpression && !searchingWithWs && Object.keys(newExpression).length === 0) {
        dispatch(
          requestAsync({
            ...requestPageOfAnalysis(
              {
                pageSize: pageSize,
                sortingColumn: columnSort?.column,
                sortingAscending: columnSort?.ascending,
              },
              false
            ), // false for replace mode
          })
        );
      } else {
        dispatch(
          requestAsync({
            ...searchPageOfAnalysis(
              {
                query: {
                  analysis_sorting: columnSort,
                  expression: newExpression,
                  page_size: pageSize,
                  workspace_id: searchingWithWs ? workspace.id : undefined
                },
              },
              false
            ), // false for replace mode
            queryKey: JSON.stringify(newQ),
          })
        );
      }
    },
    [dispatch, propFilters, rangeFilters, lastSearchQuery, approvalFilters, columnSort, prevColumnSort, setPrevColumnSort, workspace,setLastSearchWs,lastSearchWs]
  );

  useEffect(() => {
    onSearch(rawSearchQuery, PAGE_SIZE);
  }, [onSearch, rawSearchQuery]);

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
        (!pageState.isNarrowed && columnName === "sequence_id") ||
        (pageState.isNarrowed &&
          columnConfigs[columnName]?.approvable &&
          !columnConfigs[columnName]?.computed)
      );
    },
    [columnConfigs, pageState]
  );

  const onPropFilterChange = React.useCallback(
    (p: PropFilter<AnalysisResult>) => {
      setRawSearchQuery((old) => ({ ...old, clearAllFields: false }));
      setPropFilters({ ...propFilters, ...p });
    },
    [propFilters, setPropFilters, setRawSearchQuery]
  );

  const onRangeFilterChange = React.useCallback(
    (p: RangeFilter<AnalysisResult>) => {
      setRangeFilters({ ...rangeFilters, ...p });
      setRawSearchQuery((old) => ({ ...old, clearAllFields: false }));
    },
    [rangeFilters, setRangeFilters, setRawSearchQuery]
  );

  const onApprovalFilterChange = useCallback((values) => {
    setApprovalFilters(values);
    setRawSearchQuery((old) => ({ ...old, clearAllFields: false }));
  },[])

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

  const getDependentColumns = React.useCallback(
    (columnName: keyof AnalysisResult) => {
      return (
        columnConfigs[columnName]?.approves_with ??
        ([] as Array<keyof AnalysisResult>)
      ).filter((x: keyof AnalysisResult) => !columnConfigs[x].computed);
    },
    [columnConfigs]
  );

  const onNarrowHandler = React.useCallback(
    () =>
      setPageState({
        ...pageState,
        isNarrowed: !pageState.isNarrowed,
      }),
    [setPageState, pageState]
  );

  const getCellStyle = React.useCallback(
    (rowId: string, columnId: string, value: any, cell: any) => {
      const rowSelectionClass =
        selection[rowId] && !pageState.isNarrowed ? " selectedRow" : "";
      if (
        value !== 0 &&
        value !== false &&
        !value &&
        !isPrimaryApprovalColumn(columnId)
      ) {
        return `emptyCell${rowSelectionClass}`;
      }
      if (`${value}` === "Invalid Date") {
        return `emptyCell${rowSelectionClass}`;
      }
      if (!canApproveColumn(columnId)) {
        return `cell${rowSelectionClass}`;
      }
      if (approvals && approvals[rowId]) {
        // sequence_id changes color depending on if specific fields are approved
        if (columnId === "sequence_id") {
          let sequenceStyle = "cell";
          PRIMARY_APPROVAL_FIELDS.forEach((f) => {
            if (approvals[rowId][f] !== ApprovalStatus.approved) {
              if (sequenceStyle != `rejectedCell`) {
                sequenceStyle = "unapprovedCell";
              }
              if (approvals[rowId][f] === ApprovalStatus.rejected) {
                sequenceStyle = `rejectedCell`;
              }
            }
          });
          // Some species require serotype to also be provided before the sequence can be considered 'approved'
          const species = Species.find(
            (x) => x["name"] === cell["species_final"]
          );
          if (
            species &&
            species["requires_serotype"] &&
            approvals[rowId]["serotype_final"] !== ApprovalStatus.approved &&
            sequenceStyle != `rejectedCell`
          ) {
            sequenceStyle = "unapprovedCell";
          }
          return `${sequenceStyle}${rowSelectionClass}`;
        }
        if (approvals[rowId][columnId] === ApprovalStatus.approved) {
          return `cell${rowSelectionClass}`;
        }
        if (approvals[rowId][columnId] === ApprovalStatus.rejected) {
          return `rejectedCell${rowSelectionClass}`;
        }
      }
      return `unapprovedCell${rowSelectionClass}`;
    },
    [approvals, canApproveColumn, isPrimaryApprovalColumn, pageState, selection]
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

  const handleConfirm = () => {
    submitChange({
      [modalInfo.rowId]: { [modalInfo.columnId]: modalInfo.value },
    });
    setModalOpen(false);
  };

  const handleClose = () => {
    setModalOpen(false);
  };

  const onFreeTextEdit = React.useCallback(
    (rowId: string, field: string) => (val: string) => {
      // May need a more dynamic check if other fields should use same dialog.
      if (field === "cluster_id") {
        setModalInfo({ rowId, columnId: field, value: val });
        setModalOpen(true);
      } else if (columnConfigs[field].editable_format === "date") {
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
      const rowInstitution = displayData.find((row) => row.sequence_id == rowId)
        .institution;
      const editIsAllowed =
        columnConfigs[columnId].editable ||
        user.institution == rowInstitution ||
        columnConfigs[columnId].cross_org_editable ||
        user.data_clearance === "all";

      if (value !== 0 && value !== false && !value && !editIsAllowed) {
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
          v = (value as Array<AnalysisResultAllOfQcFailedTests>).reduce(
            (acc, x) => {
              if (acc !== "") {
                acc += ", ";
              }
              acc += `${x.display_name}: ${x.reason}`;
              return acc;
            },
            ""
          );
        }
        if (columnId === "st_alleles") {
          v = Object.entries(value).reduce((acc, [k, val]) => {
            if (acc !== "") {
              acc += ", ";
            }
            acc += `${k}: ${val}`;
            return acc;
          }, "");
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

        if (editIsAllowed) {
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
      displayData,
      user,
    ]
  );

  const openDetailsView = React.useCallback(
    (primaryKey: string, row: Row<AnalysisResult>) => {
      setDetailsIsolate({
        id: row.original.isolate_id,
        institution: row.original.institution,
      });
    },
    [setDetailsIsolate]
  );

  if (!columnLoadState.isFinished) {
    <Loading />;
  }

  const [columnOrder, setColumnOrder] = React.useState(undefined);
  const [columnReorder, setColumnReorder] = React.useState(
    undefined as ColumnReordering
  );

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

  const onSelectCallback = React.useCallback(
    (sel) => {
      dispatch(setSelection(sel));
    },
    [dispatch]
  );

  const content = (
    <React.Fragment>
      <Box role="navigation" gridColumn="2 / 4" pb={5}>
        <Flex justifyContent="flex-end">
          <AnalysisSearch
            onSearchChange={setRawSearchQuery}
            isDisabled={pageState.isNarrowed}
            searchTerms={searchTerms}
          />
          <Box minW="250px" ml="5">
            <AnalysisViewSelector />
          </Box>
        </Flex>
      </Box>
      <Box role="main" gridColumn="2 / 4" borderWidth="1px" rounded="md">
        <Flex m={2} alignItems="center" flexDirection="row" justify="space-between">
          <Flex flexDirection="row" alignItems = "center">
          <Judgement<AnalysisResult>
            isNarrowed={pageState.isNarrowed}
            onNarrowHandler={onNarrowHandler}
            getDependentColumns={getDependentColumns}
            checkColumnIsVisible={checkColumnIsVisible}
            selection={selection}
            />
          {!pageState.isNarrowed && (
            <AnalysisSelectionMenu
             selection={selection}
              isNarrowed={pageState.isNarrowed}
              data={displayData}
              search={onSearch}
              lastSearchQuery={lastSearchQuery}
            />)}

          {(!workspace || workspace.id !== "temp-workspace") && Object.keys(selection).length > 0 && <Button marginLeft={2} paddingX={3} onClick={() => {
            // Make a temp workspace
            setWorkspace({
              id: "temp-workspace",
              name: "temp-workspace",
              samples: Object.values(selection).map(s => s.original.id)
            });
            dispatch(setSelection({}));
          }}>
            Make workspace
          </Button>}
          {workspace && workspace.id === "temp-workspace" && <Button marginLeft={2} paddingX={3} onClick={() => {
            const workspaceName = prompt("Workspace name");
            sendToWorkspace(workspaceName);
          }}>
            Save workspace
          </Button>}
          {workspace && <Button marginLeft={2} paddingX={3} onClick={() => {
            setWorkspace(null);
          }}> Leave workspace
            </Button>}
            {workspace && <SendToMicroreactButton workspace={workspace} />}
          </Flex>
          <Flex alignItems="center" justify="space-between">

            <WorkspaceMenu workspaces={workspaces} workspace={workspace} selection={selection} addToWorkspace={addToWorkspace} removeFromWorkspace={removeFromWorkspace} setWorkspace={setWorkspace} />
          

            <Flex grow={1} width="100%" />
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
            <ExportButton
              data={displayData}
              columns={columns.map((x) => x.accessor) as any}
              selection={selection}
              />
          </Flex>
        </Flex>

        <Box height="calc(100vh - 250px)">
          <DataTable<AnalysisResult>
            columns={columns || []}
            columnReordering={columnReorder}
            columnSort={columnSort}
            setNewColumnOrder={setColumnOrder}
            setColumnSort={setColumnSort}
            canSelectColumn={canSelectColumn}
            canApproveColumn={canApproveColumn}
            isJudgedCell={isJudgedCell}
            approvableColumns={approvableColumns}
            getDependentColumns={getDependentColumns}
            getCellStyle={getCellStyle}
            getStickyCellStyle={getStickyCellStyle}
            data={
              displayData
            }
            renderCellControl={renderCellControl}
            primaryKey="sequence_id"
            selectionClassName={pageState.isNarrowed ? "approvingCell" : ""}
            onSelect={onSelectCallback}
            selection={selection}
            onDetailsClick={openDetailsView}
            view={view}
            onLoadNextPage={loadNextPage}
            hasMoreData={hasMoreData}
            isLoadingNextPage={isLoadingNextPage}
          />
        </Box>

        <Box role="status" gridColumn="2 / 4" margin={2}>
          {isPending && `${t("Fetching...")} ${data.length}`}
          {isFinished &&
            !pageState.isNarrowed &&
            `${t("Showing")} ${displayData.length} ${t("of")} ${totalCount} ${t(
              "records"
            )}.`}
          {!pageState.isNarrowed && Object.keys(selection).length > 0
            ? ` ${Object.keys(selection).length} selected.`
            : null}
          {isFinished &&
            pageState.isNarrowed &&
            `${t("Staging")} ${Object.keys(selection).length} ${t("records")}.`}
          {isLoadingRef.current && " Loading more results..."}
        </Box>
      </Box>
      <CellConfirmModal
        rowId={modalInfo.rowId}
        field={modalInfo.columnId}
        value={modalInfo.value}
        isOpen={isModalOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
      />
      <Debug>
        <p>redux selection:</p>
        <pre>{JSON.stringify(selection, undefined, "  ")}</pre>
      </Debug>
    </React.Fragment>
  );

  return (
    <React.Fragment>
      {detailsIsolate ? (
        <AnalysisDetailsModal
          isolate={detailsIsolate}
          onClose={onAnalysisDetailsModalClose}
        />
      ) : null}
      <HalfHolyGrailLayout
        sidebar={
          <AnalysisSidebar
            clearFieldFromSearch={clearFieldFromSearch}
            queryOperands={lastQueryOperands}
            filterOptions={filterOptions}
            onPropFilterChange={onPropFilterChange}
            onRangeFilterChange={onRangeFilterChange}
            onApprovalFilterChange={onApprovalFilterChange}
            isDisabled={pageState.isNarrowed}
          />
        }
        content={content}
      />
      <Health />
    </React.Fragment>
  );
}
