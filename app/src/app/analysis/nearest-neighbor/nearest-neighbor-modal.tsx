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
import { AnalysisResult, NearestNeighborsResponse } from "sap-client";
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
  const [searchIndex, setSearchIndex] = useState(0);
  const [cutoff, setCutoff] = React.useState(15);
  const onChangeCutoff = (value: string) => {
    const n = parseInt(value);
    if (isNaN(n)) {
      setCutoff(0);
      return;
    }
    setCutoff(n);
  };
  const [unknownsAreDiffs, setUnknownsAreDiffs] = useState<boolean>(false);
  const toast = useToast();
  const dispatch = useDispatch();

  const nearestNeighborsResponses = useSelector(
    (state: { entities: NearestNeighborsResponseSlice }) =>
      state.entities.nearestNeighborsResponses
  );

  const [{ isPending, status }, searchNearestNeighbors] = useMutation(
    (req: any) => {
      return getNearestNeighbors(req);
    }
  );

  const submitAllRequests = useCallback(async () => {
    const selectionArray = Object.values(selection);

    const responses: Record<string, NearestNeighborsResponse> = {};
    const promises = selectionArray.map(async (item) => {
      const req = {
        id: item.original.id,
        cutoff,
        unknownsAreDiffs,
      };
      try {
        const {transformed} = await searchNearestNeighbors(req);
        if (transformed?.nearestNeighborsResponses){
          Object.assign(responses,transformed.nearestNeighborsResponses)
        }
      } catch (error) {
        console.error("Failed request for:", req.id, error);
        return null;
      } finally {
        // This ensures index is updated whether it succeeds or fails
        setSearchIndex((prev) => prev + 1);
      }
    });

    await Promise.all(promises);
    return responses
  }, [selection, unknownsAreDiffs, cutoff, searchNearestNeighbors]);

  useEffect(() => {
    if (!isSearching) {
      setSearchIndex(0);
    }
  }, [isSearching]);

  const onSearch = useCallback(async () => {
    setIsSearching(true);
    setSearchIndex(0); // reset progress
    try {
      const responses = await submitAllRequests();

      const neighbors: Record<string, AnalysisResult> = {};
      for (const sequenceId of Object.keys(selection)) {
        const row = selection[sequenceId];
        const response = responses[row.original.id];
        response.result?.forEach((neighbor) => {
          //if (!selection.sequence_id) {
          if (!selection[neighbor.sequence_id]) {
            neighbors[neighbor.sequence_id] = neighbor;
          }
        });
      }

      if (Object.keys(neighbors).length) {
        const newSelection = { ...selection };
        Object.values(neighbors).forEach((n) => {
          newSelection[n.sequence_id] = { cells: {}, original: n };
        });
        dispatch(setSelection(newSelection));
        toast({
          title: `Found ${Object.keys(neighbors).length} neighbor(s)`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error("Unexpected error during search:", err);
      toast({
        title: `Error running search`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSearching(false);
      onClose();
    }
  }, [selection, dispatch, toast, onClose, submitAllRequests]);

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
