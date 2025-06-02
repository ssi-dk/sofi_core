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
import {
  AnalysisResult,
  NearestNeighborsRequest,
} from "sap-client";
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
import { sequencesFromIsolateId } from "../analysis-details/analysis-history-configs";
import { isTemplateExpression, preProcessFile } from "typescript";

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
  const [newReqs, setNewReqs] = useState<
    Array<NearestNeighborsRequest>
  >([]);
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

  const [{ isPending, status }, searchNearestNeighbors] = useMutation(
    (index: number) => {
      const req = newReqs[index]
      return getNearestNeighbors(req);
    }
  );

  const handleSearchComplete = useCallback(() => {
    const newSelection = { ...selection };
    let totalhits = 0;
    Object.values(newReqs).forEach((value) => {
      const neighbors =
        nearestNeighborsResponses[serializeNNRequest(value)].result;
      totalhits += neighbors.length;
      Object.values(neighbors).forEach((n) => {
        newSelection[n.sequence_id] = { cells: {}, original: n };
      });
    });
    dispatch(setSelection(newSelection));
    showToast(`Found ${totalhits} neighbor(s)`, "success");
    setIsSearching(false);
    onClose();
  }, [
    dispatch,
    nearestNeighborsResponses,
    onClose,
    selection,
    showToast,
    newReqs,
  ]);

  useEffect(() => {
    const ids = newReqs.map(serializeNNRequest);
    if (isSearching && isPending) {
      if (status >= 200 && status < 300) {
        if (searchIndex < newReqs.length) {
          // Still searching search some more
          setSearchIndex((prev) => prev + 1);
          return;
        }
        if (
          searchIndex !== 0 && 
          searchIndex + 1 == newReqs.length && 
          ! ids.every((index) => nearestNeighborsResponses[index] !== undefined)
        ) {
          // Wait for the last result
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
        showToast(`Found ${Object.keys(neighbors).length} neighbor(s).`,"success");
        if (Object.values(neighbors).length) {
          const newSelection = Object.assign({}, selection);
          Object.values(neighbors).forEach((n) => {
            newSelection[n.sequence_id] = {
              cells: {},
              original: n,
            };
          });
          dispatch(setSelection(newSelection))
        }
      } else{
        showToast(`Error`, "error");
      }
      onClose();
    }
  },[
    t,
    showToast,
    isSearching,
    isPending,
    status,
    nearestNeighborsResponses,
    onClose,
    dispatch,
    selection,
    searchIndex,
    newReqs,
    serializeNNRequest,
  ]);


  useEffect(() => {
    const requestedIDs = newReqs.map((item) => {
      return serializeNNRequest(item);
    });
    const allReady = requestedIDs.every(
      (id) =>
        nearestNeighborsResponses !== undefined &&
        nearestNeighborsResponses[id] !== undefined
    );

    if (allReady && isSearching) {
      handleSearchComplete();
    }
  }, [
    nearestNeighborsResponses,
    isSearching,
    newReqs,
    handleSearchComplete,
  ]);

  useEffect(() => {
    if (!isSearching) {
      setSearchIndex(0);
    }
  }, [isSearching]);

  const submitRequests = useCallback(async () => {
    const promises = newReqs.map((req) => {
      return searchNearestNeighbors(req);
    });
    await Promise.all(promises);
    // NNqueryConfigs.map( (queryConfig) => {
    //   dispatch(mutateAsync(queryConfig))
    // } );
  }, [
    submittedSearches,
    cutoff,
    unknownsAreDiffs,
    selection,
    //dispatch,
    searchNearestNeighbors,
  ]);

  const onSearch = useCallback(async () => {
    setNewReqs(
      Object.values(selection).map((item) => {
        return {
          id: item.original.id,
          cutoff: cutoff,
          unknownsAreDiffs: unknownsAreDiffs,
        };
      })
    );
    setIsSearching(true);
    await searchNearestNeighbors(0); // start search
  }, [setIsSearching, setNewReqs, searchNearestNeighbors]);

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
