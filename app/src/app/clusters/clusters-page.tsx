import Header from "app/header/header";
import { RootState } from "app/root-reducer";
import { useDispatch, useSelector } from "react-redux";
import React, { useEffect, useMemo, useState } from "react";
import { IfPermission } from "auth/if-permission";
import {
  Box,
  Flex,
  IconButton,
  useToast,
  Text,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
} from "@chakra-ui/react";
import { AnalysisResult, Permission, QueryExpression, QueryOperator } from "sap-client";
import { useTranslation } from "react-i18next";
import { requestAsync } from "redux-query";
import {
  requestPageOfAnalysis,
  searchPageOfAnalysis,
} from "app/analysis/analysis-query-configs";
import { ChevronDownIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { rootCertificates } from "tls";
import { DateTime } from "luxon";
import { useRequest } from "redux-query-react";


const expression: QueryExpression = {
  left: {
    field: "cluster_id",
    term: "*",
  },
};

export const Clusterspage = () => {
  const { t } = useTranslation();
  const toast = useToast();


  const [reqState] = useRequest({
    ...searchPageOfAnalysis({ query: { expression, page_size: 100 } }),
    queryKey: JSON.stringify({
      expression,
    }),
  });

  let rawDate = useSelector<RootState>(
    (root) => root.entities.analysis
  ) as Record<string, AnalysisResult>;
  let data = reqState.isFinished ? rawDate : {};

  const enforce_date = (d: Date | string) => ( typeof  d === "string" || d instanceof String) ? new Date(d) : d

  const display_value = (key: string, v: any) => {
    if (key.startsWith("date")) {
        return enforce_date(v as string).toLocaleString();
    }

    if (typeof v === "string") {
      return v
    }
    if (typeof v === "number") {
      return v.toString()
    }
    if (Array.isArray(v)) {
      return v.map(v => v.toString()).join(", ")
    }
    if (typeof v === "object") {
      return Object.entries(v).map(([k,v]) => k + ": " + v).join(", ")
    }

    console.log("Failed to determine type of", key, "This should be impossible.", typeof v);
    return v.toString();
  }
  
  
  const date_mod = (v: AnalysisResult) => {
    const {date_modified, date_received} = v;
    if (date_modified) {
      return enforce_date(date_modified)
    }
    return enforce_date(date_received)
  }

  const [clusters, speciesMap] = useMemo(() => {
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
        (a, b) => date_mod(b).getTime() - date_mod(a).getTime()
      )
    );

    clusterList.sort(
      ([_akey, a], [_bkey, b]) =>
        date_mod(b[0]).getTime() - date_mod(a[0]).getTime()
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

    return [clusterList, speciesMap];
  }, [data]);

  const [openClusters, setOpenClusters] = useState<string[]>([]);

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
                  <Th>{t("Latest modification")}</Th>
                  {/* <Th width="80px"></Th> */}
                </Tr>
              </Thead>
              <Tbody>
                {clusters.map(([cluster_id, sequences]) => (
                  <Tr key={cluster_id} verticalAlign="top">
                    <Td>{cluster_id}</Td>
                    <Td>{[...speciesMap.get(cluster_id)].join(", ")}</Td>
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
                                  date_mod(s)
                                ).toRelative()}
                                )
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                      {openClusters.find((c) => c == cluster_id) && (
                        <>
                          <div >
                            {sequences.map((s) => (
                              <div key={s.sequence_id}>
                                <span>
                                  <b>
                                    {t("Sequence")} {s.sequence_id}
                                  </b>{" "}
                                  (
                                  {DateTime.fromJSDate(
                                    date_mod(s)
                                  ).toRelative()}
                                  )
                                </span>
                                <ul style={{ marginLeft: "2rem" }}>
                                  {Object.entries(s)
                                    .filter(([_, v]) => !!v)
                                    .map(([k, v]) => (
                                      <li key={k}>
                                        {k}={display_value(k,v)}
                                      </li>
                                    ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </Td>
                    <Td>
                      {sequences.filter(s => date_mod(s).getTime() > (Date.now() - 60*60*24*7*1000)).length}
                    </Td>
                    <Td>
                      {date_mod(sequences[0]).toLocaleString("DK")} (
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
