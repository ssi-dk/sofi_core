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
  NearestNeighborsResponse,
  getNearestNeighbors,
} from "./nearest-neighbor-query-configs";
import { Checkbox } from "@chakra-ui/react";
import { useMutation } from "redux-query-react";

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

  const nnResponse = useSelector(
    (state: { entities: NearestNeighborsResponse }) => state.entities.nnResponse
  );

  const [{ isPending, status }, searchNearestNeighbors] = useMutation(() => {
    const first = Object.values(selection)[0];

    const req = {
      id: first.original.id,
      cutoff,
      unknownsAreDiffs,
    };
    return getNearestNeighbors(req);
  });

  const onSearch = useCallback(async () => {
    setIsSearching(true);
    await searchNearestNeighbors();
  }, [setIsSearching, selection, cutoff, unknownsAreDiffs, dispatch]);

  React.useEffect(() => {
    if (isSearching && status >= 200 && status < 300 && !isPending) {
      console.dir(nnResponse);
      toast({
        title: `Found ${nnResponse.result.length} neighbor(s)`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      onClose();
    }
  }, [t, toast, isSearching, isPending, status, nnResponse]);

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
