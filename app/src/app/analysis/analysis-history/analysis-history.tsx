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
} from "@chakra-ui/react";
import { Organization } from "sap-client";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "app/root-reducer";
import { useRequest } from "redux-query-react";
import { Loading } from "loading";
import {
  sequencesFromIsolateId,
  IsolateWithData,
} from "./analysis-history-configs";
import AnalysisHistoryTable from "./analysis-history-table";
import ReloadMetadataWidget from "./reload-widget/reload-metadata-widget";

const getAnalysisHistory = (state: {
  entities: { analysisHistory: IsolateWithData };
}) => state.entities.analysisHistory;

type AnalysisHistoryProps = {
  isolateId: string;
  isOpen: boolean;
  onClose: () => void;
};

const AnalysisHistory = (props: AnalysisHistoryProps) => {
  const { t } = useTranslation();
  const { isolateId, isOpen, onClose } = props;

  const analysisHistory = useSelector(getAnalysisHistory) ?? {};
  const institution =
    Object.values(analysisHistory).find((x) => x.institution)?.institution ??
    Organization.Other;

  const [{ isPending, status }, refresh] = useRequest(
    sequencesFromIsolateId(isolateId)
  );

  return (
    <React.Fragment>
      <Modal isOpen={isOpen} onClose={onClose} size="full">
        <ModalOverlay />
        <ModalContent mt="0">
          <ModalHeader pl="7">{`${t(
            "History for isolate"
          )} ${isolateId}`}</ModalHeader>
          <ModalCloseButton />
          <ModalBody overflowY="auto" px="7">
            {isPending ? (
              <Loading />
            ) : (
              <AnalysisHistoryTable sequences={analysisHistory} />
            )}
          </ModalBody>

          <ModalFooter>
            <ReloadMetadataWidget
              isolateId={isolateId}
              institution={institution}
            />
            <Button mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </React.Fragment>
  );
};

export default React.memo(AnalysisHistory);
