import React, { useState } from "react";
import { Button, useToast } from "@chakra-ui/react";
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
  const toast = useToast();
  const [needsNotify, setNeedsNotify] = useState(true);

  const [{ isPending, status }, reloadMetadata] = useMutation(() =>
    reloadMetadataByIsolate(isolateId, institution)
  );

  const analysisHistory = useSelector(getReloadResponse) ?? {};

  const reloadClick = React.useCallback(() => {
    setNeedsNotify(true);
    reloadMetadata();
  }, [reloadMetadata]);

  // reload success status toast
  React.useMemo(() => {
    if (needsNotify && status >= 200 && status < 300 && !isPending) {
      toast({
        title: t("MetadataReloaded"),
        description: `${t("IsolateMetadataReloadedFor")} ${isolateId}.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setNeedsNotify(false);
    }
  }, [t, toast, needsNotify, isPending, isolateId, status]);

  // reload failure status toast
  React.useMemo(() => {
    if (needsNotify && status >= 300 && !isPending) {
      toast({
        title: t("MetadataNotReloaded"),
        description: `${t("IsolateMetadataNotReloadedFor")} ${isolateId}.`,
        status: "error",
        duration: null,
        isClosable: true,
      });
      setNeedsNotify(false);
    }
  }, [t, toast, needsNotify, isPending, isolateId, status]);

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
