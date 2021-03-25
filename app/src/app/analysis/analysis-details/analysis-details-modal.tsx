import React from "react";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Tab,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
} from "@chakra-ui/react";
import { Organization } from "sap-client";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useRequest } from "redux-query-react";
import { Loading } from "loading";
import {
  IsolateWithData,
  sequencesFromIsolateId,
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
    (Object.values(analysisHistory).find((x: any) => x.institution) as any)
      ?.institution ?? Organization.Other;

  const [{ isPending, status }, refresh] = useRequest(
    sequencesFromIsolateId(isolateId)
  );

  return (
    <React.Fragment>
      <Modal isOpen={isOpen} onClose={onClose} size="full">
        <ModalOverlay />
        <ModalContent mt="0">
          <ModalHeader pl="7">
            {`${t("Details for isolate")}: ${isolateId}`}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody overflowY="auto" px="7">
            {isPending ? (
              <Loading />
            ) : (
              <Tabs isFitted variant="enclosed">
                <TabList mb="1em">
                  <Tab>{t("Analysis History")}</Tab>
                  <Tab>{t("Associated Details")}</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <AnalysisHistoryTable sequences={analysisHistory} />
                  </TabPanel>
                  <TabPanel>
                    <p>Insert some HTML here</p>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            )}
          </ModalBody>

          <ModalFooter>
            <ReloadMetadataWidget
              isolateId={isolateId}
              institution={institution}
            />
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              {t("Close")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </React.Fragment>
  );
};

export default React.memo(AnalysisHistory);