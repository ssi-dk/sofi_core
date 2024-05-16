import React, { useCallback, useEffect, useState } from "react";
import {
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Spinner,
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
import { useDispatch } from "react-redux";
import { requestAsync } from "redux-query";
import { nearestNeighborsRequest } from "./nearest-neighbor-query-configs";

type Props = {
  selection: DataTableSelection<AnalysisResult>;
  onClose: () => void;
};

export const NearestNeighborModal = (props: Props) => {
  const { t } = useTranslation();
  const { selection, onClose } = props;
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [cutoff, setCutoff] = React.useState(15);
  const onChangeCutoff = (value) => setCutoff(value);

  const dispatch = useDispatch();

  useEffect(() => {
    // TODO
    const first = Object.values(selection)[0];
    dispatch(
      requestAsync({
        ...nearestNeighborsRequest({ 
          id: first.original.id, 
          cutoff, 
          unknownsAreDiffs: true }),
      })
    );
  }, [dispatch, selection, cutoff]);

  const onSearch = useCallback(() => {
    setIsSearching(true);
    alert(
      `Search, cutoff ${cutoff}, ids ` +
        Object.values(selection)
          .map((s) => s.original.id)
          .join(", ")
    );
  }, [setIsSearching, selection, cutoff]);

  return (
    <Modal isOpen={true} onClose={onClose} size="sm">
      <ModalOverlay />
      <ModalContent mt="0">
        <ModalHeader pl="7">{`${t("Nearest Neighbor")}`}</ModalHeader>
        <ModalCloseButton />
        <ModalBody overflowY="auto" px="7">
          {!isSearching ? (
            <>
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
            </>
          ) : (
            // TODO: unknowns_are_diffs
            <Spinner size="xl" />
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
