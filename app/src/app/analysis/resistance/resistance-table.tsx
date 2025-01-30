import React, { Fragment, useEffect, useMemo, useState } from "react";
import {
  Center,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { AnalysisResult, Gene, Sample } from "sap-client";
import { DataTableSelection } from "../data-table/data-table";
import { requestGetSampleById } from "./resistance-query-configs";
import { requestAsync } from "redux-query";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "app/root-reducer";
import { ChevronDownIcon, ChevronRightIcon } from "@chakra-ui/icons";

type Props = {
  selection: DataTableSelection<AnalysisResult>;
};

export const ResistanceTable = (props: Props) => {
  const { selection } = props;
  const dispatch = useDispatch();
  const [collapsedRows, setCollapsedRows] = useState<Record<string, boolean>>(
    () => {
      const initialCollapsedState: Record<string, boolean> = {};
      Object.values(selection).forEach((row) => {
        initialCollapsedState[row.original.id] = true;
      });
      return initialCollapsedState;
    }
  );

  const samples = useSelector<RootState>((s) => s.entities.samples) as Record<
    string,
    Sample
  >;

  const genes = useMemo<Record<string, Record<string, Gene>>>(() => {
    const newGenes = {} as Record<string, Record<string, Gene>>;
    const sampleIds = Object.keys(samples ?? {});
    sampleIds.forEach((sampleId) => {
      const sample = samples[sampleId];
      const phenotypeValues = Object.values(
        sample.categories.resistance?.report.phenotypes ?? {}
      );
      const result = phenotypeValues.map((p) => p.genes);
      const sampleGenes = result.reduce((a, b) => Object.assign(a, b), {});
      newGenes[sampleId] = sampleGenes;
    });
    return newGenes;
  }, [samples]);

  const amrClasses = useMemo<Record<string, Array<string>>>(() => {
    const newAmrClasses = {} as Record<string, Array<string>>;

    Object.values(selection).forEach((row) => {
      const sample = samples?.[row.original.id];
      if (!sample) {
        return;
      }

      const phenotypes = sample.categories.resistance?.report?.phenotypes;
      if (!phenotypes) {
        return;
      }
      const phenotypeValues = Object.values(phenotypes);

      const classes = phenotypeValues
        .map((phenotype) => phenotype.amr_classes ?? [])
        .reduce((a, b) => a.concat(b), []);

      const set = new Set(classes);
      for (const cls of set.values()) {
        const phenotypeKeys = Object.keys(phenotypes);
        const amrPhenotypeKeys = phenotypeKeys.filter((phenotypeKey) => {
          return phenotypes[phenotypeKey].amr_classes?.find((c) => c === cls);
        });

        newAmrClasses[cls] = Array.from(
          new Set([...(newAmrClasses[cls] ?? []), ...amrPhenotypeKeys])
        ).sort();
      }
    });

    return newAmrClasses;
  }, [samples, selection]);

  useEffect(() => {
    const ids = Object.values(selection).map((row) => row.original.id);
    ids.forEach((id) => {
      if (samples?.[id]) {
        // Skip if already fetched
        return;
      }
      dispatch(
        requestAsync({
          ...requestGetSampleById(id),
        })
      );
    });
  }, [dispatch, samples, selection]);

  const headerPaddingColSpan =
    12 -
    Object.keys(amrClasses)
      .map((amrClass) => amrClasses[amrClass].length)
      .reduce((a, b) => a + b, 0);

  const toggleRowCollapse = (rowId: string) => {
    setCollapsedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  };

  return (
    <TableContainer>
      <Table variant="unstyled" size="sm">
        <Thead style={{ backgroundColor: "#90cdf4" }}>
          <Tr>
            <Th colSpan={2} style={{ borderRight: "1px solid black" }}>
              &nbsp;
            </Th>
            {Object.keys(amrClasses).map((amrClass, index) => {
              return (
                <Th
                  key={`amr-${index}`}
                  colSpan={amrClasses[amrClass].length}
                  style={{
                    borderLeft: "1px solid black",
                    borderRight: "1px solid black",
                  }}
                >
                  <Center>{amrClass}</Center>
                </Th>
              );
            })}
            {headerPaddingColSpan > 0 ? (
              <Th colSpan={headerPaddingColSpan}></Th>
            ) : null}
          </Tr>
          <Tr>
            <Th>Sample</Th>
            <Th style={{ borderRight: "1px solid black" }}>Summary</Th>
            {Object.values(amrClasses).map((phenotypes, index) => {
              return phenotypes.map((phenotype, i) => {
                const isLast = i === phenotypes.length - 1;
                return (
                  <Th
                    key={`${phenotype}-${index}`}
                    style={isLast ? { borderRight: "1px solid black" } : {}}
                  >
                    {phenotype}
                  </Th>
                );
              });
            })}
            {headerPaddingColSpan > 0 ? (
              <Th colSpan={headerPaddingColSpan}></Th>
            ) : null}
          </Tr>
        </Thead>
        <Tbody>
          {Object.values(selection).map((row) => {
            const sampleId = row.original.id;
            const sequenceId = row.original.sequence_id;
            const isRowCollapsed = collapsedRows[sampleId] ?? true;
            return (
              <Fragment key={sampleId}>
                <Tr>
                  <Td>
                    {sequenceId}
                    <div
                      onClick={() => toggleRowCollapse(sampleId)}
                      style={{ cursor: "pointer" }}
                    >
                      {isRowCollapsed ? (
                        <ChevronRightIcon />
                      ) : (
                        <ChevronDownIcon />
                      )}{" "}
                      Gene Details
                    </div>
                  </Td>
                  <Td>
                    {samples?.[sampleId]?.categories?.resistance?.summary}
                  </Td>
                  {Object.keys(amrClasses).map((amrClass, index) => {
                    return amrClasses[amrClass].map((phenotypeName, pIndex) => {
                      if (pIndex === 0) {
                        const phenotype =
                          samples?.[sampleId]?.categories?.resistance?.report
                            .phenotypes[phenotypeName];
                        const phenotypeGenes = Object.keys(
                          phenotype?.genes ?? {}
                        ).join(", ");

                        let backgroundColor = "#9D9D9D"; //Default gray color
                        if (phenotype) {
                          for (const gene of Object.values(phenotype.genes)) {
                            if (gene.ref_seq_length === gene.alignment_length) {
                              if (gene.identity === 100) {
                                backgroundColor = "#6EBE50"; // Green if everything matches in at least one gene
                                break;
                              } else {
                                backgroundColor = "#BEDCBE"; // Light green if only seq and aln length match
                              }
                            }
                          }
                        }

                        return (
                          <Th
                            backgroundColor={
                              phenotypeGenes ? backgroundColor : ""
                            }
                            key={`${phenotypeName}-${index}`}
                          >
                            {phenotypeGenes}
                          </Th>
                        );
                      }
                      return <Th key={`${phenotypeName}-${index}`}></Th>;
                    });
                  })}
                  {headerPaddingColSpan > 0 ? (
                    <Th colSpan={headerPaddingColSpan}></Th>
                  ) : null}
                </Tr>
                {!samples?.[sampleId] && (
                  <Tr>
                    <Td>
                      <Spinner />
                    </Td>
                  </Tr>
                )}
                {samples?.[sampleId] &&
                  Object.keys(genes?.[sampleId] ?? {}).length > 0 &&
                  !isRowCollapsed && (
                    <>
                      <Tr
                        style={{ fontWeight: 700, backgroundColor: "#A29DC4" }}
                      >
                        <Td>Gene/Mut name</Td>
                        <Td>Gene/Mut ID</Td>
                        <Td>%ID</Td>
                        <Td>Ref length</Td>
                        <Td>Aln Length</Td>
                        <Td>Phenotype</Td>
                        <Td>Class</Td>
                        <Td>Depth</Td>
                        <Td>Contig</Td>
                        <Td>Start pos</Td>
                        <Td>End pos</Td>
                        <Td>Notes</Td>
                        <Td>PMID</Td>
                        <Td>Accession nr</Td>
                      </Tr>
                      {Object.keys(genes?.[sampleId] ?? {}).map((geneId) => {
                        const gene = genes[sampleId][geneId];
                        return (
                          <Tr
                            key={`${sampleId}-${geneId}`}
                            style={{ backgroundColor: "#A29DC4" }}
                          >
                            <Td>{geneId}</Td>
                            <Td>{gene.gene_id}</Td>
                            <Td>{gene.identity}</Td>
                            <Td>{gene.ref_seq_length}</Td>
                            <Td>{gene.alignment_length}</Td>
                            <Td>{gene.phenotypes?.join(", ")}</Td>
                            <Td>
                              {samples?.[
                                sampleId
                              ].categories.resistance.report.phenotypes[
                                gene.phenotypes[0]
                              ].amr_classes?.join(", ")}
                            </Td>
                            <Td>{gene.depth}</Td>
                            <Td>{gene.contig}</Td>
                            <Td>{gene.contig_start_pos}</Td>
                            <Td>{gene.contig_end_pos}</Td>
                            <Td>{gene.notes?.join("; ")}</Td>
                            <Td>{gene.pmids?.join(", ")}</Td>
                            <Td>{gene.ref_acc}</Td>
                          </Tr>
                        );
                      })}
                    </>
                  )}
              </Fragment>
            );
          })}
        </Tbody>
      </Table>
    </TableContainer>
  );
};
