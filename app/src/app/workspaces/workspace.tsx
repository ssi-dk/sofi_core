import React, { useCallback } from "react";
import { Box, Heading, IconButton, Spinner } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import HalfHolyGrailLayout from "layouts/half-holy-grail";
import { useMutation, useRequest } from "redux-query-react";
import {
  getWorkspace,
  removeWorkspaceSample,
} from "./workspaces-query-configs";
import { useSelector } from "react-redux";
import { RootState } from "app/root-reducer";
import {
  AnalysisResult,
  AnalysisResultAllOfQcFailedTests,
  WorkspaceInfo,
} from "sap-client";
import DataTable from "../analysis/data-table/data-table";
import {
  ColumnSlice,
  requestColumns,
} from "app/analysis/analysis-query-configs";
import { Column } from "react-table";
import { UserDefinedViewInternal } from "models/user-defined-view-internal";
import { Loading } from "loading";
import { AnalysisViewSelector } from "app/analysis/view-selector/analysis-view-selector";
import { DeleteIcon } from "@chakra-ui/icons";
import { SendToMicroreactButton } from "./send-to-microreact-button";

type Props = {
  id: string;
};

export function Workspace(props: Props) {
  const { t } = useTranslation();
  const { id } = props;

  const [workspaceQueryState] = useRequest(getWorkspace(id));
  const [columnLoadState] = useRequest(requestColumns());

  const workspace = useSelector<RootState>(
    (s) => s.entities.workspace ?? {}
  ) as WorkspaceInfo;

  const columnConfigs = useSelector<RootState>(
    (s) => s.entities.columns
  ) as ColumnSlice;

  const view = useSelector<RootState>(
    (s) => s.view.view
  ) as UserDefinedViewInternal;

  const columns = React.useMemo(
    () =>
      Object.keys(columnConfigs || []).map(
        (k) =>
          ({
            accessor: k,
            sortType: !k.startsWith("date")
              ? "alphanumeric"
              : (a, b, column) => {
                  const aDate = a.original[column]?.getTime() ?? 0;
                  const bDate = b.original[column]?.getTime() ?? 0;

                  return aDate - bDate;
                },
            Header: t(k),
          } as Column<AnalysisResult>)
      ),
    [columnConfigs, t]
  );

  const deleteWorkspaceSampleCallback = useMutation((sampleId: string) =>
    removeWorkspaceSample({ sampleId, workspaceId: id })
  )[1];

  const onRemoveSample = useCallback(
    (sampleId) => {
      const ok = confirm(
        t("Are you sure you want to remove the sequence from the workspace?")
      );
      if (ok) {
        deleteWorkspaceSampleCallback(sampleId);
      }
    },
    [deleteWorkspaceSampleCallback, t]
  );

  const renderCellControl = React.useCallback(
    (
      rowId: string,
      columnId: string,
      value,
      columnIndex: number,
      original: AnalysisResult
    ) => {
      if (
        value === undefined ||
        value === null ||
        String(value) === "Invalid Date"
      ) {
        value = "";
      }
      let v = `${value}`;

      if (value instanceof Date) {
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

      return (
        <div style={{ backgroundColor: "white" }}>
          {columnIndex === 0 ? (
            <IconButton
              size="1em"
              variant="unstyled"
              onClick={() => onRemoveSample(original.id)}
              aria-label="Remove"
              icon={<DeleteIcon marginTop="-0.5em" />}
              ml="1"
            />
          ) : null}
          {`${v}`}
        </div>
      );
    },
    [onRemoveSample]
  );

  if (!columnLoadState.isFinished) {
    return <Loading />;
  }

  let content = <Spinner size="xl" />;
  if (workspaceQueryState.isFinished) {
    content = (
      <React.Fragment>
        <Box role="navigation" gridColumn="2 / 4" pb={5}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Heading>{`${workspace?.name}`}</Heading>
            <div style={{ display: "flex", width: "500px" }}>
              <SendToMicroreactButton workspace={workspace.id} />
              <div style={{ flexGrow: 1, minWidth: 0 }}>
                <AnalysisViewSelector manageViews={false} />
              </div>
            </div>
          </div>
        </Box>
        <Box role="main" gridColumn="2 / 4" borderWidth="1px" rounded="md">
          <Box height="calc(100vh - 250px)">
            <DataTable<AnalysisResult>
              columns={columns || []}
              setNewColumnOrder={() => {}}
              canSelectColumn={() => false}
              canApproveColumn={() => false}
              isJudgedCell={() => false}
              approvableColumns={[]}
              getDependentColumns={() => []}
              getCellStyle={() => ""}
              getStickyCellStyle={() => ""}
              data={workspace.samples}
              renderCellControl={renderCellControl}
              primaryKey="sequence_id"
              selection={{}}
              view={view}
            />
          </Box>
        </Box>
      </React.Fragment>
    );
  }
  return <HalfHolyGrailLayout content={content} sidebar={null} />;
}
