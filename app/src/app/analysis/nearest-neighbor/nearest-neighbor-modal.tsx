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
import { AnalysisResult, NearestNeighborsRequest, NearestNeighborsResponse } from "sap-client";
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
import { requestAsync, mutateAsync } from "redux-query";
import { setSelection } from "../analysis-selection-configs";
import { sequencesFromIsolateId } from "../analysis-details/analysis-history-configs";

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
  const [submittedSearches, setSubmittedSearches] = useState<Array<NearestNeighborsRequest>>([])
  const toast = useToast();
  const dispatch = useDispatch();

  const showToast = useCallback((message: string, status: UseToastOptions["status"]) => {
    return toast({
      title: message,
      status: status,
      duration: 5000,
      isClosable: true,
    });
  },[toast])

  const nearestNeighborsResponses = useSelector(
    (state: { entities: NearestNeighborsResponseSlice }) =>
      state.entities.nearestNeighborsResponses
  );


  const [{ isPending, status }, searchNearestNeighbors] = useMutation(
    (req: any) => {
      return getNearestNeighbors(req);
    }
  );

  // const submitAllRequests = useCallback(async () => {
  //   const selectionArray = Object.values(selection);

  //   const responses: Record<string, NearestNeighborsResponse> = {};
  //   const promises = selectionArray.map(async (item) => {
  //     const req = {
  //       id: item.original.id,
  //       cutoff,
  //       unknownsAreDiffs,
  //     };
  //     const queryConfig = getNearestNeighbors(req);
  //     const promise = dispatch(requestAsync(queryConfig))
  //     try {
  //       const { transformed } = await searchNearestNeighbors(req);
  //       if (transformed?.nearestNeighborsResponses){
  //         Object.assign(responses,transformed.nearestNeighborsResponses)
  //       }
  //     } catch (error) {
  //       console.error("Failed request for:", req.id, error);
  //       return null;
  //     } finally {
  //       // This ensures index is updated whether it succeeds or fails
  //       setSearchIndex((prev) => prev + 1);
  //     }
  //   });

  //   await Promise.all(promises);
  //   return responses
  // }, [selection, unknownsAreDiffs, cutoff, searchNearestNeighbors, dispatch]);

  const handleSearchComplete = useCallback(() => {
    const newSelection = { ...selection };
    let totalhits = 0
    Object.values(submittedSearches).forEach((value) => {
      const neighbors = nearestNeighborsResponses[serializeNNRequest(value)].result;
      totalhits += neighbors.length;
      Object.values(neighbors).forEach((n) => {
        newSelection[n.sequence_id] = { cells: {}, original: n };
      });
    });
    dispatch(setSelection(newSelection));
    showToast(
      `Found ${totalhits} neighbor(s)`,
      "success");
    setIsSearching(false);
    onClose();
   },[dispatch, nearestNeighborsResponses, onClose, selection, showToast, submittedSearches]);

  useEffect(() => {
    const requestedIDs = submittedSearches.map((item) => {
      return serializeNNRequest(item)
    })
    const allReady = requestedIDs.every(
      (id) => nearestNeighborsResponses !== undefined &&
          nearestNeighborsResponses[id] !== undefined
    );

    if (allReady && isSearching) {
      // Now safe to proceed with processing the Redux state
      handleSearchComplete();
    }
  }, [nearestNeighborsResponses, isSearching, submittedSearches, handleSearchComplete]);

  useEffect(() => {
    if (!isSearching) {
      setSearchIndex(0);
    }
  }, [isSearching]);

  const submitRequests = useCallback(async () => {
    setSubmittedSearches(Object.values(selection).map((item) => {
      return {
        id: item.original.id,
        cutoff: cutoff,
        unknownsAreDiffs: unknownsAreDiffs,
      };
    }))
    const promises = submittedSearches.map( async (req)=>{
      return searchNearestNeighbors(req);
    })
    await Promise.all(promises)
    // NNqueryConfigs.map( (queryConfig) => {
    //   dispatch(mutateAsync(queryConfig))
    // } );
  },[
    submittedSearches, 
    cutoff,
    unknownsAreDiffs, 
    selection, 
    //dispatch,
    searchNearestNeighbors,
  ]);

  const onSearch = useCallback(async () => {
    setIsSearching(true);
    setSearchIndex(0); // reset progress
    submitRequests();
    //await submitAllRequests();

  }, [submitRequests]);


  // const onSearch = useCallback(async () => {
  //   setIsSearching(true);
  //   setSearchIndex(0); // reset progress
  //   try {
  //     const responses = await submitAllRequests();

  //     const neighbors: Record<string, AnalysisResult> = {};
  //     for (const sequenceId of Object.keys(selection)) {
  //       const row = selection[sequenceId];
  //       const response = responses[row.original.id];
  //       response.result?.forEach((neighbor) => {
  //         //if (!selection.sequence_id) {
  //         if (!selection[neighbor.sequence_id]) {
  //           neighbors[neighbor.sequence_id] = neighbor;
  //         }
  //       });
  //     }

  //     if (Object.keys(neighbors).length) {
  //       const newSelection = { ...selection };
  //       Object.values(neighbors).forEach((n) => {
  //         newSelection[n.sequence_id] = { cells: {}, original: n };
  //       });
  //       dispatch(setSelection(newSelection));
  //       toast({
  //         title: `Found ${Object.keys(neighbors).length} neighbor(s)`,
  //         status: "success",
  //         duration: 5000,
  //         isClosable: true,
  //       });
  //     }
  //   } catch (err) {
  //     console.error("Unexpected error during search:", err);
  //     toast({
  //       title: `Error running search`,
  //       status: "error",
  //       duration: 5000,
  //       isClosable: true,
  //     });
  //   } finally {
  //     setIsSearching(false);
  //     onClose();
  //   }
  // }, [selection, dispatch, toast, onClose, submitAllRequests]);

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
