import React from "react";
import { Button } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { useMutation } from "redux-query-react";
import { MetadataReloadResponse, Organization } from "sap-client";
import {
  sequencesFromIsolateId,
  IsolateWithData,
} from "../analysis-history-configs";
import AnalysisHistoryTable from "../analysis-history-table";
import { reloadMetadataByIsolate } from "./reload-configs";

const getReloadResponse = (state: {
  entities: { reloadResponse: MetadataReloadResponse };
}) => state.entities.reloadResponse;

type ReloadMetadataWidgetProps = {
  isolateId: string;
  institution: Organization;
};

const ReloadMetadataWidget = (props: ReloadMetadataWidgetProps) => {
  const { isolateId, institution } = props;
  const { t } = useTranslation();

  const [{ isPending }, reloadMetadata] = useMutation(() =>
    reloadMetadataByIsolate(isolateId, institution)
  );

  const analysisHistory = useSelector(getReloadResponse) ?? {};

  const reloadClick = React.useCallback(() => {
    reloadMetadata();
  }, [reloadMetadata]);

  return institution === Organization.Other ? (
    <React.Fragment />
  ) : (
    <Button
      isLoading={isPending}
      onClick={reloadClick}
      colorScheme="blue"
      variant="outline"
      mr={3}
    >
      {`${t("Update")} ${institution} metadata`}
    </Button>
  );
};

export default React.memo(ReloadMetadataWidget);
