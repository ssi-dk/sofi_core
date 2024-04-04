import React, { Fragment, useEffect, useMemo } from "react";
import { Spinner, Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import { AnalysisResult } from "sap-client";
import { DataTableSelection } from "../data-table/data-table";
import { requestGetSampleById } from "./resistance-query-configs";
import { requestAsync } from "redux-query";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "app/root-reducer";

type Props = {
  selection: DataTableSelection<AnalysisResult>;
};

type Gene = {
  gene_id: string;
  identity: number;
  ref_seq_length: number;
  alignment_length: number;
  phenotypes?: Array<string>;
  depth: number;
  contig: string;
  contig_start_pos: number;
  contig_end_pos: number;
  notes?: Array<string>;
  pmids?: Array<string>;
  ref_acc: string;
}

export const ResistanceTable = (props: Props) => {
  const { selection } = props;
  const dispatch = useDispatch();

  const samples = useSelector<RootState>((s) => s.entities.samples) as Record<
    string,
    // TODO: change to response type
    {
      name?: string;
      categories?: {
        resistance?: {
          summary?: string;
          report?: {
            phenotypes?: Record<
              string,
              {
                amr_classes: Array<string>;
                genes: Record<
                  string,
                  Gene
                >;
              }
            >;
          };
        };
      };
    }
  >;

  const genes = useMemo(() => {
    const newGenes = {} as Record<
      string,
      Record<
        string,
        Gene
      >
    >;
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

  useEffect(() => {
    const ids = Object.keys(selection);
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
  
  return (
    <Table variant="unstyled">
      <Thead style={{ backgroundColor: "#90cdf4" }}>
        <Tr>
          <Th>Sample</Th>
          <Th>Summary</Th>
          <Th></Th>
          <Th></Th>
          <Th></Th>
          <Th></Th>
          <Th></Th>
          <Th></Th>
          <Th></Th>
          <Th></Th>
          <Th></Th>
          <Th></Th>
          <Th></Th>
          <Th></Th>
        </Tr>
      </Thead>
      <Tbody>
        {Object.keys(selection).map((sequenceId) => (
          <Fragment key={sequenceId}>
            <Tr>
              <Td>{samples?.[sequenceId]?.name || sequenceId}</Td>
              <Td>{samples?.[sequenceId]?.categories?.resistance?.summary}</Td>
              <Td></Td>
              <Td></Td>
              <Td></Td>
              <Td></Td>
              <Td></Td>
              <Td></Td>
              <Td></Td>
              <Td></Td>
              <Td></Td>
              <Td></Td>
              <Td></Td>
              <Td></Td>
            </Tr>
            {!samples?.[sequenceId] && <Tr>
                <Td>
                  <Spinner />
                </Td>
              </Tr> }
            {samples?.[sequenceId] && Object.keys(genes?.[sequenceId] ?? {}).length > 0 && 
              <>
                <Tr style={{ fontWeight: 700, backgroundColor: "#A29DC4" }}>
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
                {Object.keys(genes?.[sequenceId] ?? {}).map((geneId) => {
                  const gene = genes[sequenceId][geneId];
                  return (
                    <Tr key={`${sequenceId}-${geneId}`} style={{ backgroundColor: "#A29DC4" }}>
                      <Td>{geneId}</Td>
                      <Td>{gene.gene_id}</Td>
                      <Td>{gene.identity}</Td>
                      <Td>{gene.ref_seq_length}</Td>
                      <Td>{gene.alignment_length}</Td>
                      <Td>{gene.phenotypes?.join(", ")}</Td>
                      <Td>{samples?.[sequenceId].categories.resistance.report.phenotypes[gene.phenotypes[0]].amr_classes?.join(", ")}</Td>
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
            }
          </Fragment>
        ))}
      </Tbody>
    </Table>
  );
};
