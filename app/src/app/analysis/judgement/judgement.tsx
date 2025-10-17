import React, { useState } from "react";
import { IfPermission } from "auth/if-permission";
import { Button, Spinner, useToast } from "@chakra-ui/react";
import { CheckIcon, DragHandleIcon, NotAllowedIcon } from "@chakra-ui/icons";
import { AnalysisResult, ApprovalRequest, Permission } from "sap-client";
import { useTranslation } from "react-i18next";
import { sendApproval, sendRejection } from "../analysis-approval-configs";
import { useSelector } from "react-redux";
import { RootState } from "app/root-reducer";
import { useMutation } from "redux-query-react";
import { NotEmpty } from "utils";
import { DataTableSelection } from "../data-table/data-table";

type Props<T extends NotEmpty> = {
  isNarrowed: boolean;
  onNarrowHandler: () => void;
  getDependentColumns: (columnName: keyof T) => Array<keyof T>;
  checkColumnIsVisible: (columnName: keyof T) => boolean;
};

type ErrorObject = {
  [sequence_id: string]: {
    [field: string]: string;
  };
};

export const Judgement = <T extends NotEmpty>(props: Props<T>) => {
  const {
    isNarrowed,
    onNarrowHandler,
    getDependentColumns,
    checkColumnIsVisible,
  } = props;
  const { t } = useTranslation();
  const toast = useToast();

  const [errors, setErrors] = React.useState<ErrorObject>();
  const [error, setError] = React.useState<boolean>();

  const rootStateData = useSelector<RootState>((s) => s.entities.analysis);

  const data = React.useMemo(() => {
    return Object.values(rootStateData ?? {}) as AnalysisResult[];
  }, [rootStateData]);

  const approvalErrors = useSelector<RootState>(
    (s) => s.entities.approvalErrors
  ) as Array<string>;

  const selection = useSelector<RootState>(
    (s) => s.selection.selection
  ) as DataTableSelection<AnalysisResult>;

  const [
    { isPending: pendingApproval, status: approvalStatus },
    doApproval,
  ] = useMutation((payload: ApprovalRequest) => sendApproval(payload));
  const [
    { isPending: pendingRejection, status: rejectionStatus },
    doRejection,
  ] = useMutation((payload: ApprovalRequest) => sendRejection(payload));

  const [needsApproveNotify, setNeedsApproveNotify] = useState(false);
  const [needsRejectNotify, setNeedsRejectNotify] = useState(false);

  React.useEffect(() => {
    if (error) {
      const description = Object.entries(errors).reduceRight((acc, [k, v]) => {
        return Object.entries(v).reduceRight((accp, [kp, vp]) => {
          return (
            accp +
            `\n\tColumn '${kp}' needs ${vp} to be included in the selection.`
          );
        }, acc + `\nSequence '${k}': `);
      }, "");
      toast({
        title: t("Cannot approve when dependent fields are missing"),
        description,
        status: "error",
        duration: null,
        isClosable: true,
      });
      setNeedsApproveNotify(false);
    }
  }, [error, errors, toast, t]);

  // Display rejection toasts
  React.useEffect(() => {
    if (needsRejectNotify && !pendingRejection) {
      if (rejectionStatus >= 200 && rejectionStatus < 300) {
        toast({
          title: t("Rejection submitted"),
          description: `${
            data.filter((x) => selection[x.sequence_id]).length
          } ${t("records")} ${t("have been rejected.")}`,
          status: "info",
          duration: null,
          isClosable: true,
        });
      } else {
        toast({
          title: t("Error"),
          description: String(rejectionStatus),
          status: "error",
          duration: null,
          isClosable: true,
        });
      }
      setNeedsRejectNotify(false);
    }
  }, [
    t,
    rejectionStatus,
    data,
    selection,
    toast,
    needsRejectNotify,
    pendingRejection,
  ]);

  /**
   * Check that every selected field does not "approve" with fields not present in selection.
   *
   * Some fields are "approved" with other fields. E.g., qc_final with species_final, run_id and sequence_id. In this
   * case if qc_final is in the selection, then the three other fields must also be in the selection. #104595
   * @param selection1 Selected columns from view
   */
  const approveSelection = React.useCallback(() => {
    setNeedsApproveNotify(true);

    const errorObject: ErrorObject = {};

    for (const [sequenceId, sequenceSelection] of Object.entries(selection)) {
      const approvedFields = Object.entries(sequenceSelection.cells)
        .filter(
          ([k, v]) => v && checkColumnIsVisible(k as keyof AnalysisResult)
        )
        .map(([k, _]) => k);
      approvedFields.forEach((field) => {
        const needed = getDependentColumns(field as keyof AnalysisResult);
        for (const e of needed) {
          if (!approvedFields.some((x) => x === e)) {
            if (errorObject[sequenceId] === undefined) {
              errorObject[sequenceId] = {};
            }
            if (errorObject[sequenceId][field] === undefined) {
              errorObject[sequenceId][field] = `'${e}'`;
            } else {
              errorObject[sequenceId][field] += `, '${e}'`;
            }
          }
        }
      });
    }

    if (Object.keys(errorObject).length > 0) {
      setErrors(errorObject);
      setError(true);
    } else {
      const matrix = {};
      const requiredValues = {};
      Object.keys(selection).forEach((key) => {
        matrix[key] = Object.fromEntries(
          Object.entries(selection[key].cells).filter(([k, _]) =>
            checkColumnIsVisible(k as keyof AnalysisResult)
          )
        );
        requiredValues[key] = {};
        requiredValues[key]["resfinder_version"] =
          selection[key].original.resfinder_version ?? "";
      });
      doApproval({ matrix, required_values: requiredValues });
    }
  }, [
    selection,
    doApproval,
    setNeedsApproveNotify,
    getDependentColumns,
    checkColumnIsVisible,
  ]);

  const rejectSelection = React.useCallback(() => {
    setNeedsRejectNotify(true);
    const matrix = {};
    const requiredValues = {};
    Object.keys(selection).forEach((key) => {
      matrix[key] = Object.fromEntries(
        Object.entries(selection[key].cells).filter(([k, _]) =>
          checkColumnIsVisible(k as keyof AnalysisResult)
        )
      );
      requiredValues[key] = {};
      requiredValues[key]["resfinder_version"] =
        selection[key].original.resfinder_version ?? "";
    });
    doRejection({ matrix, required_values: requiredValues });
  }, [selection, doRejection, setNeedsRejectNotify, checkColumnIsVisible]);

  // Display approval toasts
  React.useEffect(() => {
    if (needsApproveNotify && !pendingApproval) {
      if (approvalStatus >= 200 && approvalStatus < 300) {
        toast({
          title: t("Approval submitted"),
          description: `${
            data.filter((x) => selection[x.sequence_id]).length
          } ${t("records")} ${t("have been submitted for approval.")}`,
          status: "info",
          duration: 3000,
          isClosable: true,
        });
        if (approvalErrors?.length > 0) {
          approvalErrors.forEach((e) => {
            toast({
              title: t("An approval failed"),
              description: e,
              status: "error",
              duration: null,
              isClosable: true,
            });
          });
        }
      } else {
        toast({
          title: t("Error"),
          description: String(approvalStatus),
          status: "error",
          duration: null,
          isClosable: true,
        });
      }
      setNeedsApproveNotify(false);
    }
  }, [
    t,
    approvalErrors,
    approvalStatus,
    data,
    selection,
    toast,
    needsApproveNotify,
    pendingApproval,
  ]);

  if (pendingApproval || pendingRejection) {
    return <Spinner />;
  }

  return (
    <IfPermission permission={Permission.approve}>
      <Button
        leftIcon={<DragHandleIcon />}
        margin="4px"
        onClick={onNarrowHandler}
        disabled={!isNarrowed && Object.keys(selection ?? {}).length === 0}
      >
        {isNarrowed ? t("Return") : t("Stage")}
      </Button>
      {isNarrowed ? (
        <Button
          leftIcon={<CheckIcon />}
          margin="4px"
          disabled={!isNarrowed}
          onClick={approveSelection}
        >
          {t("Approve")}
        </Button>
      ) : null}
      {isNarrowed ? (
        <Button
          leftIcon={<NotAllowedIcon />}
          margin="4px"
          disabled={!isNarrowed}
          onClick={rejectSelection}
        >
          {t("Reject")}
        </Button>
      ) : null}
    </IfPermission>
  );
};
