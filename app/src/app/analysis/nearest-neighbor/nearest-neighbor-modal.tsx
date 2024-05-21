import React, { useCallback, useEffect, useState } from "react";
import {
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { AnalysisResult } from "sap-client";
import { DataTableSelection } from "../data-table/data-table";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  NearestNeighborsResponseSlice,
  getNearestNeighbors,
} from "./nearest-neighbor-query-configs";
import { Checkbox } from "@chakra-ui/react";
import { useMutation } from "redux-query-react";
import { setSelection } from "../analysis-selection-configs";

type Props = {
  selection: DataTableSelection<AnalysisResult>;
  onClose: () => void;
};

export const NearestNeighborModal = (props: Props) => {
  const { t } = useTranslation();
  const { selection, onClose } = props;
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [cutoff, setCutoff] = React.useState(15);
  const onChangeCutoff = (value: string) => setCutoff(parseInt(value));
  const [unknownsAreDiffs, setUnknownsAreDiffs] = useState<boolean>(true);
  const toast = useToast();
  const dispatch = useDispatch();
  const [searchIndex, setSearchIndex] = useState(0);

  const nearestNeighborsResponses = useSelector(
    (state: { entities: NearestNeighborsResponseSlice }) =>
      state.entities.nearestNeighborsResponses
  );

  const [{ isPending, status }, searchNearestNeighbors] = useMutation(
    (index: number) => {
      const first = Object.values(selection)[index];

      const req = {
        id: first.original.id,
        cutoff,
        unknownsAreDiffs,
      };
      return getNearestNeighbors(req);
    }
  );

  const onSearch = useCallback(async () => {
    setIsSearching(true);
    await searchNearestNeighbors(0);
  }, [setIsSearching, searchNearestNeighbors]);

  useEffect(() => {
    if (searchIndex === 0) {
      return;
    }
    searchNearestNeighbors(searchIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchIndex]);

  useEffect(() => {
    if (isSearching && !isPending) {
      if (status >= 200 && status < 300) {
        if (searchIndex + 1 !== Object.values(selection).length) {
          setSearchIndex((prev) => prev + 1);
          return;
        }

        if (
          searchIndex !== 0 &&
          searchIndex + 1 == Object.values(selection).length &&
          Object.keys(nearestNeighborsResponses).length !==
            Object.values(selection).length
        ) {
          // Wait for last response
          return;
        }

        const neighbors: Record<string, AnalysisResult> = {};
        for (const sequenceId of Object.keys(selection)) {
          const row = selection[sequenceId];
          const response = nearestNeighborsResponses[row.original.id];
          response.result?.forEach((neighbor) => {
            // If not in selection, set as neighbor
            if (!selection[neighbor.sequence_id]) {
              neighbors[neighbor.sequence_id] = neighbor;
            }
          });
        }

        toast({
          title: `Found ${Object.keys(neighbors).length} neighbor(s)`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        if (Object.values(neighbors).length) {
          const newSelection = Object.assign({}, selection);
          Object.values(neighbors).forEach((n) => {
            newSelection[n.sequence_id] = {
              cells: {},
              original: n,
            };
          });
          dispatch(setSelection(newSelection));
        }
      } else {
        toast({
          title: `Error`,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }

      onClose();
    }
  }, [
    t,
    toast,
    isSearching,
    isPending,
    status,
    nearestNeighborsResponses,
    onClose,
    dispatch,
    selection,
    searchIndex,
  ]);

  return (
    <Modal isOpen={true} onClose={onClose} size="sm">
      <ModalOverlay />
      <ModalContent mt="0">
        <ModalHeader pl="7">{`${t("Nearest Neighbor")}`}</ModalHeader>
        <ModalCloseButton />
        <ModalBody overflowY="auto" px="7">
          {!isSearching ? (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <div>
                Cutoff:
                <NumberInput
                  min={0}
                  max={50}
                  value={cutoff}
                  onChange={onChangeCutoff}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </div>
              <div>
                <Checkbox
                  onChange={(e) => setUnknownsAreDiffs(e.target.checked)}
                  isChecked={unknownsAreDiffs}
                >
                  Unknowns are diffs
                </Checkbox>
              </div>
            </div>
          ) : (
            <>
              <Spinner size="xl" />
              <div>
                {searchIndex} / {Object.values(selection).length}
              </div>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            {t("Close")}
          </Button>
          <Button
            colorScheme="blue"
            mr={3}
            onClick={onSearch}
            disabled={isSearching}
          >
            {t("Search")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
