import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
} from "@chakra-ui/react"
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "app/root-reducer";
import { useRequest } from "redux-query-react";
import { Loading } from "loading"
import { sequencesFromIsolateId, IsolateWithData } from "./analysis-history-configs";
import AnalysisHistoryTable from "./analysis-history-table"

const getAnalysisHistory = state => state.entities.analysisHistory;

/*{
  const hist = state.entities.analysisHistory;
  return Object.keys(hist)
  .sort()
  .reduce((obj, key) => {
    obj[key] = hist[key]; 
    return obj;
  },
  {} as IsolateWithData)
};*/

type AnalysisHistoryProps = {
  isolateId: string;
  isOpen: boolean;
  onClose: () => void;
};

const AnalysisHistory = (props: AnalysisHistoryProps) => {
  const { t } = useTranslation();
  const { isolateId, isOpen, onClose } = props;

  const analysisHistory = useSelector(getAnalysisHistory) ?? {};
  const [{ isPending, status }, refresh] = useRequest(sequencesFromIsolateId(isolateId));

  return (
    <React.Fragment>
      <Modal isOpen={isOpen} onClose={onClose} size="full">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader pl="7">{`${t("History for isolate")} ${isolateId}`}</ModalHeader>
          <ModalCloseButton />
          <ModalBody px="7">
            {isPending 
            ? <Loading /> 
            : <AnalysisHistoryTable sequences={analysisHistory} />}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button variant="ghost">Secondary Action</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </React.Fragment>
  );
};

export default React.memo(AnalysisHistory);
