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
                amr_classes: string;
                genes: Record<
                  string,
                  {
                    gene_id: string;
                  }
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
        {
          gene_id: string;
        }
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
        </Tr>
      </Thead>
      <Tbody>
        {Object.keys(selection).map((sequenceId) => (
          <Fragment key={sequenceId}>
            <Tr>
              <Td>{samples?.[sequenceId]?.name || sequenceId}</Td>
              <Td>{samples?.[sequenceId]?.categories?.resistance?.summary}</Td>
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
                </Tr>
                {Object.keys(genes?.[sequenceId] ?? {}).map((gene) => {
                  return (
                    <Tr style={{ backgroundColor: "#A29DC4" }}>
                      <Td>{gene}</Td>
                      <Td>{genes[sequenceId][gene].gene_id}</Td>
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
