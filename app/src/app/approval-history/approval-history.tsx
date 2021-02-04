import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Box,
  Flex,
  Button,
  useToast,
  Text,
  Heading,
  Grid,
} from "@chakra-ui/react";
import {
  ArrowBackIcon,
  DeleteIcon,
} from "@chakra-ui/icons";
import { Approval, ApprovalAllOfStatusEnum } from "sap-client";
import { useMutation, useRequest } from "redux-query-react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { RootState } from "app/root-reducer";
import {
  revokeApproval,
  fetchApprovals,
} from "app/analysis/analysis-approval-configs";
import AnalysisHeader from "app/header/header";

export default function ApprovalHistory() {
  const [historyLoadState] = useRequest(fetchApprovals());

  // TODO: Figure out how to make this strongly typed
  const approvalHistory = useSelector<RootState>((s) =>
    Object.values(s.entities.approvals ?? {})
  ) as Approval[];

  const { t } = useTranslation();
  const toast = useToast();

  const [revocationLoadState, doRevoke] = useMutation((id: string) =>
    revokeApproval({ approvalId: id })
  );

  const [needsNotify, setNeedsNotify] = useState(true);

  const revokeItem = React.useCallback(
    (id: string) => {
      setNeedsNotify(true);
      doRevoke(id);
    },
    [doRevoke, setNeedsNotify]
  );

  // Display approval toasts
  React.useMemo(() => {
    if (
      needsNotify &&
      revocationLoadState.status >= 200 &&
      revocationLoadState.status < 300 &&
      !revocationLoadState.isPending
    ) {
      toast({
        title: t("Approval undone"),
        description: `${t("Approval was successfully revoked.")}`,
        status: "info",
        duration: null,
        isClosable: true,
      });
      setNeedsNotify(false);
    }
  }, [t, revocationLoadState, toast, needsNotify, setNeedsNotify]);

  return (
    <Box w="100%">
      <AnalysisHeader />
      <Flex mt={5}>
        <Box minW="300px" pr={5} />
        <Box borderWidth="1px" rounded="md" overflowX="auto" width="80%" padding="20px">
          <Flex padding="20px" alignItems="center" gap={6} justifyContent="space-between">
            <Heading>{`${t("My approval history")}`}</Heading>
            <NavLink to="/">
              <Button leftIcon={<ArrowBackIcon />}>{t("Back")}</Button>
            </NavLink>
          </Flex>
          <Box margin="4px" />
          <Grid padding="20px" templateColumns="repeat(5, 1fr)" gap={6}>
            <Heading size="md">Id</Heading>
            <Heading size="md">{t("Time")}</Heading>
            <Heading size="md">{t("Approved by")}</Heading>
            <Heading size="md">{t("Status")}</Heading>
          </Grid>
          {approvalHistory &&
            approvalHistory.map((h) => {
              return (
                <Grid padding="20px" templateColumns="repeat(5, 1fr)" gap={6}>
                  <Text>{h.id}</Text>
                  <Text>{`${new Date(
                    h.timestamp
                  ).toLocaleDateString()} ${new Date(
                    h.timestamp
                  ).toLocaleTimeString()}`}</Text>
                  <Text>{h.approver}</Text>
                  <Text>{h.status}</Text>
                  {h.status === ApprovalAllOfStatusEnum.submitted && (
                    <Button
                      leftIcon={<DeleteIcon />}
                      onClick={() => revokeItem(h.id)}
                    >
                      {`${t("Revoke approval")}`}
                    </Button>
                  )}
                </Grid>
              );
            })}
          {historyLoadState.isPending && `${t("Fetching...")}`}
          {historyLoadState.isFinished &&
            `${t("Found")} ${approvalHistory.length} ${t("approvals")}.`}
        </Box>
      </Flex>
    </Box>
  );
}
