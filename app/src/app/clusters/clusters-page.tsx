import Header from "app/header/header";
import { RootState } from "app/root-reducer";
import { useSelector } from "react-redux";
import React, { useMemo, useState } from "react";
import { IfPermission } from "auth/if-permission";
import {
  Box,
  Flex,
  IconButton,
  useToast,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
import { AnalysisResult, Permission, QueryExpression } from "sap-client";
import { useTranslation } from "react-i18next";
import {
  searchPageOfAnalysis,
} from "app/analysis/analysis-query-configs";
import { ChevronDownIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { DateTime } from "luxon";
import { useRequest } from "redux-query-react";

const expression: QueryExpression = {
  left: {
    field: "cluster_id",
    term: "*",
  },
};

const enforceDate = (d: Date | string) => (typeof d === "string" || d instanceof String) ? new Date(d) : d

const displayValue = (key: string, v: any) => {
  if (!v) {
    return ""
  }

  if (key.startsWith("date")) {
    return enforceDate(v as string).toLocaleString();
  }

  if (typeof v === "string") {
    return v
  }
  if (typeof v === "number") {
    if (Math.floor(v) == v) {
      return v;
    }
    const [int, rem] = v.toString().split(".");
    return int + "." + rem.slice(0, 2);
  }
  if (Array.isArray(v)) {
    return v.map(arr_v => arr_v.toString()).join(", ")
  }
  if (typeof v === "object") {
    return Object.entries(v).map(([k, obj_v]) => k + ": " + obj_v).join(", ")
  }

  console.log("Failed to determine type of", key, "This should be impossible.", typeof v);
  return v.toString();
}

const ClusterTable = (props: { sequences: AnalysisResult[] }) => {
  // To avoid user confusion we use a differently inner styled table
  const { sequences } = props;

  // Remove the headers where no sequences have values
  const tableHeaders = [...new Set(sequences.flatMap(r => Object.keys(r).filter(k => r[k])))] as (keyof AnalysisResult)[]

  //Ensure sequence_id is first
  const index = tableHeaders.indexOf("sequence_id");
  tableHeaders.splice(index, 1); // 2nd parameter means remove one item only
  tableHeaders.unshift("sequence_id");

  return <div style={{ overflowX: "scroll", width: "50vw" }}>
    <Table variant="striped">
      <Thead>
        <Tr>
          {tableHeaders.map(key => <Th key={key} style={{ border: "1px solid black" }}>{key}</Th>)}
        </Tr>
      </Thead>
      <Tbody>
        {
          sequences.map((s, i) => <Tr key={s.sequence_id}>
            {
              tableHeaders.map(key => <Td key={key} style={{ border: "1px solid black", background: i % 2 === 1 ? "white" : undefined }}>
                {displayValue(key, s[key])}
              </Td>)
            }
          </Tr>)
        }
      </Tbody>
    </Table>
  </div>
}

export const Clusterspage = () => {
  const { t } = useTranslation();
  const toast = useToast();

  const [openClusters, setOpenClusters] = useState<string[]>([]);

  const [reqState] = useRequest({
    ...searchPageOfAnalysis({ query: { expression, page_size: 100 } }),
    queryKey: JSON.stringify({
      expression,
    }),
  });

  const rawDate = useSelector<RootState>(
    (root) => root.entities.analysis
  ) as Record<string, AnalysisResult>;
  const data = reqState.isFinished ? rawDate : {};

  const dateRun = (v: AnalysisResult) => {
    const {  date_run: date,date_received: dateReceived } = v;
    return enforceDate(date || dateReceived);
  }

  const [clusters, speciesMapMemo] = useMemo(() => {
    const clusterMap = new Map<string, AnalysisResult[]>();
    if (data) {
      Object.values(data)
        .filter((v) => !!v.cluster_id)
        .forEach((value) => {
          const current = clusterMap.get(value.cluster_id);
          if (current != undefined) {
            current.push(value);
          } else {
            clusterMap.set(value.cluster_id, [value]);
          }
        });
    }

    const clusterList = [...clusterMap.entries()];

    clusterList.forEach(([_, sequences]) =>
      sequences.sort(
        (a, b) => dateRun(b).getTime() - dateRun(a).getTime()
      )
    );

    clusterList.sort(
      ([_akey, a], [_bkey, b]) =>
        dateRun(b[0]).getTime() - dateRun(a[0]).getTime()
    );

    const speciesMap = new Map(
      clusterList.map(([cluster_id, list]) => {
        const speciesSet = list
          .filter((r) => r.species_final)
          .reduce(
            (set, value) => set.add(value.qc_provided_species),
            new Set()
          );
        if (speciesSet.size > 1) {
          toast({
            title: "Inconsistent species",
            description: `Multiple different species found for ${cluster_id}: ${speciesSet
              .values()
              .reduce((a, b) => `${a}, ${b}`)}`,
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
        return [cluster_id, speciesSet];
      })
    );

    return [clusterList, speciesMap, toast];
  }, [data, toast]);

  

  const switchOpen = (c) => (e: Event) => {
    e.stopPropagation();
    if (openClusters.find((oc) => oc == c)) {
      setOpenClusters((o) => o.filter((oc) => oc != c));
    } else {
      setOpenClusters((o) => [...o, c]);
    }
  };

  return (
    <>
      <IfPermission permission={Permission.approve}>
        <Box
          display="flex"
          padding="8"
          height="100vh"
          width="100vw"
          flexDirection="column"
        >
          <Box role="heading" gridColumn="1 / 4">
            <Header sidebarWidth="300px" />
          </Box>
          <Box
            minH="100vh"
            display="flex"
            flexDirection="column"
            alignItems="stretch"
            margin="8"
          >
            <Heading>{t("Clusters")}</Heading>
            <Table variant="striped">
              <Thead>
                <Tr>
                  <Th>{t("Cluster")}</Th>
                  <Th>{t("Species")}</Th>
                  <Th>{t("Sequences")}</Th>
                  <Th>{t("New sequences")}</Th>
                  <Th>{t("Latest sample date")}</Th>
                  {/* <Th width="80px"></Th> */}
                </Tr>
              </Thead>
              <Tbody>
                {clusters.map(([cluster_id, sequences]) => (
                  <Tr key={cluster_id} verticalAlign="top">
                    <Td>{cluster_id}</Td>
                    <Td>{[...speciesMapMemo.get(cluster_id)].join(", ")}</Td>
                    <Td style={{ minWidth: "20rem" }}>
                      <Flex
                        _hover={{ backgroundColor: "gray.50" }}
                        onClick={switchOpen(cluster_id)}
                        p={1}
                        direction="row"
                        align="center"
                        cursor="pointer"
                        borderRadius="md"
                        marginLeft="-1rem"
                      >
                        <IconButton
                          icon={
                            openClusters.find((c) => c == cluster_id) ? (
                              <ChevronDownIcon />
                            ) : (
                              <ChevronRightIcon />
                            )
                          }
                          aria-label={
                            openClusters.find((c) => c == cluster_id)
                              ? "Collapse"
                              : "Expand"
                          }
                          size="sm"
                          variant="ghost"
                        />
                        {sequences.length} sequences
                      </Flex>
                      {!openClusters.find((c) => c == cluster_id) && (
                        <>
                          <ul>
                            {sequences.map((s) => (
                              <li key={s.sequence_id}>
                                {s.sequence_id} (
                                {DateTime.fromJSDate(
                                  dateRun(s)
                                ).toRelative()}
                                )
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                      {openClusters.find((c) => c == cluster_id) && <ClusterTable sequences={sequences} />}
                    </Td>
                    <Td>
                      {sequences.filter(s => dateRun(s).getTime() > (Date.now() - 60 * 60 * 24 * 7 * 1000)).length}
                    </Td>
                    <Td>
                      {dateRun(sequences[0]).toLocaleString("DK")} (
                      {sequences[0].sequence_id})
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </IfPermission>
    </>
  );
};

