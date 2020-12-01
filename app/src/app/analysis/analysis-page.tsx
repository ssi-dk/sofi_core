import React, { useState } from "react";
import { Box, Button, Flex, useToast } from "@chakra-ui/react";
import { Column } from "react-table";
import { Analysis } from "sap-client";
import { useRequests } from "redux-query-react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { RootState } from "app/root-reducer";
import DataTable from "./data-table/data-table";
import { approvedCell, selectedCell } from "./data-table/data-table.styles";
import { requestPageOfAnalysis } from "./analysis-query-configs";
import AnalysisHeader from "./header/analysis-header";
import AnalysisSidebar from "./sidebar/analysis-sidebar";
import { setSelection } from "./analysis-selection-configs";

export default function AnalysisPage() {
  const columns = React.useMemo(
    (): Column<Analysis>[] => [
      // {
      //  Header: "Run",
      //  columns: [
      {
        Header: "ID",
        accessor: "analysisId",
      },
      {
        Header: "Isolate",
        accessor: "isolateId",
      },
      {
        Header: "Job time",
        accessor: "testTimestamp",
      },
      //  ],
      // },
      // {
      //  Header: "Source",
      //  columns: [
      {
        Header: "Organization",
        accessor: "organization",
      },
      {
        Header: "Date Received",
        accessor: "dateReceived",
      },
      {
        Header: "Project",
        accessor: "project",
      },
      //  ],
      // },
      // {
      //  Header: "Details",
      //  columns: [
      {
        Header: "Agent",
        accessor: "agent",
      },
      {
        Header: "Species",
        accessor: "species",
      },
      {
        Header: "Resfinder Ver.",
        accessor: "resfinderVersion",
      },
      {
        Header: "Serum type",
        accessor: "serumType",
      },
      //   ],
      // },
      // {
      //   Header: "Status",
      //   columns: [
      //   ],
      // },
    ],
    []
  );

  const reqs = React.useMemo(
    () =>
      Array.from(Array(5).keys()).map((i) => ({
        ...requestPageOfAnalysis({ pageSize: 1000 }),
        queryKey: `${i}`,
      })),
    []
  );
  const [{ isPending, isFinished }] = useRequests(reqs);
  // TODO: Figure out how to make this strongly typed
  const data = useSelector<RootState>((s) =>
    Object.values(s.entities.analysis ?? {})
  ) as Analysis[];

  const [pageState, setPageState] = useState({ isNarrowed: false });

  const dispatch = useDispatch();
  const selection = useSelector<RootState>((s) => s.selection.selection);

  const toast = useToast();
  const { t } = useTranslation();

  const approveSelection = React.useCallback(() => {
    toast({
      title: t("Approval submitted"),
      description: `${data.filter((x) => selection[x.analysisId]).length} ${t(
        "records"
      )} ${t("have been submitted for approval.")}`,
      status: "info",
      duration: null,
      isClosable: true,
    });
  }, [selection, toast, data, t]);

  const sidebarWidth = "300px";
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
          <DataTable<Analysis>
            columns={columns}
            data={
              pageState.isNarrowed
                ? data.filter((x) => selection[x.analysisId])
                : data
            }
            primaryKey="analysisId"
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
              data.filter((x) => selection[x.analysisId]).length
            } ${t("records")}.`}
        </Box>
      </Flex>
    </Box>
  );
}
