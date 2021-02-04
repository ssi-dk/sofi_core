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

type AnalysisDetailsProps = {
  isolateId: string;
  isOpen: boolean;
  onClose: () => void;
};

const AnalysisDetails = (props: AnalysisDetailsProps) => {
  const { t } = useTranslation();
  const { isolateId, isOpen, onClose } = props;

  const analysisHistory = useSelector(getAnalysisHistory) ?? {};
  const [{ isPending, status }, refresh] = useRequest(sequencesFromIsolateId(isolateId));

  const renderIsolates = (sequences) => {
    const sortedIds = Object.keys(sequences).sort()
    return sortedIds.map(sequenceId => <React.Fragment key={sequenceId}>{sequenceId} has data: {JSON.stringify(analysisHistory[sequenceId])}</React.Fragment>)
  }

  return (
    <React.Fragment>
      <Modal isOpen={isOpen} onClose={onClose} size="full">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{`${t("History for isolate")} ${isolateId}`}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {isPending 
            ? <Loading /> 
            : renderIsolates(analysisHistory)}
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

export default React.memo(AnalysisDetails);
