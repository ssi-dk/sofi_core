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
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "app/root-reducer";
import { useRequest } from "redux-query-react";
import { Loading } from "loading";
import { Organization } from "sap-client";
import {
  sequencesFromIsolateId,
  IsolateWithData,
} from "./analysis-history-configs";
import AnalysisHistoryTable from "./analysis-history-table";

type ReloadMetadataWidgetProps = {
  isolateId: string;
  institution: Organization;
};

const ReloadMetadataWidget = (props: ReloadMetadataWidgetProps) => {
  const { isolateId, institution } = props;
  const { t } = useTranslation();

  return institution === Organization.Other ? (
    <React.Fragment />
  ) : (
    <Button colorScheme="blue" variant="outline" mr={3}>
      Reload {institution} metadata
    </Button>
  );
};

export default React.memo(ReloadMetadataWidget);
