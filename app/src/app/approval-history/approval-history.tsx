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
  Button,
  Divider,
  Tooltip,
} from "@chakra-ui/react";
import { CheckIcon, CloseIcon, TimeIcon, DeleteIcon, ChevronDownIcon, ChevronRightIcon } from "@chakra-ui/icons";
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

  const [
    revocationLoadState,
    doRevoke,
  ] = useMutation((id: string, sequences?: string[]) =>
    revokeApproval({
      approvalId: id,
      sequences: (
        sequences || approvalHistory.find((a) => a.id === id)!.sequence_ids
      ).join(";"),
    })
  );

  const [needsNotify, setNeedsNotify] = useState(true);

  const [opendropdowns, setOpendropdowns] = useState<string[]>([]);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);

  const revokeItem = React.useCallback(
    (id: string, sequences?: string[]) => {
      setNeedsNotify(true);
      doRevoke(id, sequences);
    },
    [doRevoke, setNeedsNotify]
  );

  const toggleRowExpansion = React.useCallback(
    (approvalId: string) => {
      setExpandedRows(prev => 
        prev.includes(approvalId) 
          ? prev.filter(id => id !== approvalId)
          : [...prev, approvalId]
      );
    },
    []
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
        <Heading>{`${t("Approval history")}`}</Heading>
      </Flex>
      <Table variant="striped" tableLayout="fixed" width="100%">
        <Thead>
          <Tr>
            <Th width="150px">{t("Time")}</Th>
            <Th width="150px">{t("Approved by")}</Th>
            <Th width="auto">{t("Sequences")}</Th>
            <Th width="80px">{t("Status")}</Th>
            <Th width="80px"></Th>
          </Tr>
        </Thead>
        <Tbody>
          {approvalHistory &&
            approvalHistory.map((h) => {
              const isExpanded = expandedRows.includes(h.id);
              const sequenceKeys = Object.keys(h.matrix);
              
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
                      <Flex 
                        direction="row" 
                        align="center" 
                        cursor="pointer"
                        onClick={() => toggleRowExpansion(h.id)}
                        _hover={{ backgroundColor: "gray.50" }}
                        p={1}
                        borderRadius="md"
                      >
                        <IconButton
                          icon={isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
                          aria-label={isExpanded ? "Collapse" : "Expand"}
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRowExpansion(h.id);
                          }}
                        />
                        <Text fontSize="sm" color="gray.600">
                          {sequenceKeys.length} sequence{sequenceKeys.length !== 1 ? 's' : ''}
                          {!isExpanded && sequenceKeys.length > 0 && (
                            <Text as="span" ml={2} color="gray.500">
                              ({sequenceKeys.join(', ')})
                            </Text>
                          )}
                        </Text>
                      </Flex>
                      
                      {isExpanded && (
                        <>
                          {sequenceKeys.map((x) => (
                            <React.Fragment key={x}>
                              <Flex direction="row" align="center" mt={2} wrap="wrap">
                                <Text
                                  fontWeight="semibold"
                                  mr={2}
                                >
                                  {x}:
                                </Text>
                                <Text
                                  overflow="hidden"
                                  textOverflow="ellipsis"
                                  fontSize="sm"
                                >
                                  {Object.keys(h.matrix[x]).map((y, index) => (
                                    <Text
                                      key={`${x}-${y}`}
                                      as="span"
                                      color={
                                        h.matrix[x][y] === "approved"
                                          ? "gray.900"
                                          : "red.700"
                                      }
                                    >
                                      {y}{index < Object.keys(h.matrix[x]).length - 1 ? ", " : ""}
                                    </Text>
                                  ))}
                                </Text>
                                {h.status == ApprovalAllOfStatusEnum.submitted &&
                                  sequenceKeys.length > 1 && (
                                    <IconButton
                                      icon={<DeleteIcon />}
                                      aria-label={`${t("Revoke approval")}`}
                                      onClick={() => revokeItem(h.id, [x])}
                                      size="sm"
                                      ml={2}
                                    />
                                  )}
                              </Flex>
                            </React.Fragment>
                          ))}
                        </>
                      )}
                      
                      {/* Show revoked sequences if any exist */}
                      {(h as any).revoked_sequence_ids?.length > 0 && (
                        <Flex direction="row" align="center" mt={2} wrap="wrap">
                          <Text fontWeight="semibold" mr={2} color="gray.500">
                            {t("Revoked")}:
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            {(h as any).revoked_sequence_ids.map((sid: string, index: number) => (
                              <Text
                                key={`revoked-${sid}`}
                                as="span"
                                textDecoration="line-through"
                              >
                                {sid}{index < (h as any).revoked_sequence_ids.length - 1 ? ", " : ""}
                              </Text>
                            ))}
                          </Text>
                        </Flex>
                      )}
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
