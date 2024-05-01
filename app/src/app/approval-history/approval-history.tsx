import React, { useState } from "react";
import {
  Box,
  Flex,
  IconButton,
  useToast,
  Text,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
import { CheckIcon, CloseIcon, TimeIcon, DeleteIcon } from "@chakra-ui/icons";
import { DateTime } from "luxon";
import { Approval, ApprovalAllOfStatusEnum } from "sap-client";
import { useMutation, useRequest } from "redux-query-react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { RootState } from "app/root-reducer";
import {
  revokeApproval,
  fetchApprovals,
} from "app/analysis/analysis-approval-configs";
import HalfHolyGrailLayout from "layouts/half-holy-grail";

type StatusIconProps = {
  status: ApprovalAllOfStatusEnum;
};

const StatusIcon = React.memo((props: StatusIconProps) => {
  return props.status === ApprovalAllOfStatusEnum.submitted ? (
    <CheckIcon />
  ) : props.status === ApprovalAllOfStatusEnum.cancelled ? (
    <CloseIcon />
  ) : (
    <TimeIcon />
  );
});

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
        duration: 3000,
        isClosable: true,
      });
      setNeedsNotify(false);
    }
  }, [t, revocationLoadState, toast, needsNotify, setNeedsNotify]);

  const content = (
    <Box textOverflow="hidden" minH="100vh">
      <Flex
        padding="20px"
        alignItems="center"
        gap={6}
        justifyContent="space-between"
      >
        <Heading>{`${t("My approval history")}`}</Heading>
      </Flex>
      <Table variant="striped">
        <Thead>
          <Tr>
            <Th>{t("Time")}</Th>
            <Th>{t("Approved by")}</Th>
            <Th>{t("Sequences")}</Th>
            <Th>{t("Status")}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {approvalHistory &&
            approvalHistory.map((h) => {
              return (
                <Tr verticalAlign="top" key={h.id}>
                  <Td>
                    <Text textStyle="xs">
                      {`${DateTime.fromISO(h.timestamp, { zone: "utc" })
                        .setZone("local")
                        .toFormat("yyyy-MM-dd HH:mm")}`}
                    </Text>
                  </Td>
                  <Td>
                    <Text>{h.approver}</Text>
                  </Td>
                  <Td>
                    <Flex overflow="hidden" flexDirection="column">
                      {Object.keys(h.matrix)?.map((x) => (
                        <React.Fragment key={x}>
                          <Text
                            as="pre"
                            overflow="hidden"
                            textOverflow="ellipsis"
                          >
                            {x}
                          </Text>
                          {Object.keys(h.matrix[x]).map((y) => (
                            <Text
                              key={`${x}-${y}`}
                              as="pre"
                              overflow="hidden"
                              textOverflow="ellipsis"
                              color={
                                h.matrix[x][y] === "approved"
                                  ? "gray.900"
                                  : "red.700"
                              }
                            >
                              {`    ${y}`}
                            </Text>
                          ))}
                          <Text as="pre">{`\n`}</Text>
                        </React.Fragment>
                      ))}
                    </Flex>
                  </Td>
                  <Td>
                    <StatusIcon status={h.status} />
                  </Td>
                  <Td>
                    {h.status === ApprovalAllOfStatusEnum.submitted && (
                      <IconButton
                        icon={<DeleteIcon />}
                        aria-label={`${t("Revoke approval")}`}
                        onClick={() => revokeItem(h.id)}
                      />
                    )}
                  </Td>
                </Tr>
              );
            })}
        </Tbody>
      </Table>
      {historyLoadState.isPending && `${t("Fetching...")}`}
      {historyLoadState.isFinished &&
        `${t("Found")} ${approvalHistory.length} ${t("approvals")}.`}
    </Box>
  );

  return <HalfHolyGrailLayout content={content} sidebar={null} />;
}
