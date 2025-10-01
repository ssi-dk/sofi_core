import React, { useCallback, useEffect, useState } from "react";
import {
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Spinner,
  useToast,
  UseToastOptions,
} from "@chakra-ui/react";
import { AnalysisResult, NearestNeighborsRequest } from "sap-client";
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
  serializeNNRequest,
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
  const [newReqs, setNewReqs] = useState<NearestNeighborsRequest[]>([]);
  const toast = useToast();
  const dispatch = useDispatch();

  const showToast = useCallback(
    (message: string, status: UseToastOptions["status"]) => {
      return toast({
        title: message,
        status: status,
        duration: 5000,
        isClosable: true,
      });
    },
    [toast]
  );

  const nearestNeighborsResponses = useSelector(
    (state: { entities: NearestNeighborsResponseSlice }) =>
      state.entities.nearestNeighborsResponses
  );

  const [
    { isPending, isFinished, status },
    searchNearestNeighbors,
  ] = useMutation((req: NearestNeighborsRequest) => getNearestNeighbors(req));

  useEffect(() => {
    // Collector
    if (!isSearching || isPending || !isFinished) {
      return;
    }
    const ids = newReqs.map((req) => {
      return serializeNNRequest(req);
    });
    if (isSearching && isFinished) {
      if (status >= 200 && status < 300) {
        if (searchIndex < newReqs.length) {
          // Still searching search some more
          setSearchIndex((prev) => prev + 1);
          return;
        }
        if (
          searchIndex !== 0 &&
          !ids.every((index) => nearestNeighborsResponses[index] !== undefined)
        ) {
          // Wait for the last result
          console.log();
          return;
        }
        // Needs a rewrite
        const neighbors: Record<string, AnalysisResult> = {};
        for (const reqId of ids) {
          const response = nearestNeighborsResponses[reqId];
          response.result?.forEach((neighbor) => {
            if (!selection[neighbor.sequence_id]) {
              neighbors[neighbor.sequence_id] = neighbor;
            }
          });
        }
        showToast(
          `Found ${Object.keys(neighbors).length} neighbor(s).`,
          "success"
        );
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
        showToast(`Error`, "error");
      }
      onClose();
    }
  }, [
    t,
    showToast,
    isSearching,
    isPending,
    isFinished,
    status,
    nearestNeighborsResponses,
    onClose,
    dispatch,
    selection,
    searchIndex,
    newReqs,
  ]);

  useEffect(() => {
    // Reset
    if (!isSearching) {
      setSearchIndex(0);
    }
  }, [isSearching]);

  useEffect(() => {
    if (!isSearching || newReqs.length == 0) {
      return;
    }
    if (searchIndex < newReqs.length) {
      console.log(newReqs[searchIndex]);
      searchNearestNeighbors(newReqs[searchIndex]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchIndex, isSearching, newReqs]);

  const onSearch = useCallback(async () => {
    const requests = Object.values(selection).map((item) => ({
      id: item.original.id,
      cutoff: cutoff,
      unknownsAreDiffs: unknownsAreDiffs,
    }));
    setNewReqs(requests);
    setIsSearching(true);
  }, [setIsSearching, setNewReqs, cutoff, unknownsAreDiffs, selection]);

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
