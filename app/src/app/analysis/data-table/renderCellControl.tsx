//   const renderCellControl = React.useCallback(
//     (rowId: string, columnId: string, value: any) => {
import React, { useCallback, useEffect, useRef } from "react";
import { AnalysisResult, AnalysisResultAllOfQcFailedTests, ApprovalStatus, UserInfo } from "sap-client";
import { ColumnSlice } from "../analysis-query-configs";
import {
    Editable,
    EditablePreview,
    EditableInput,
    Skeleton,
} from "@chakra-ui/react";
import InlineAutoComplete from "../../inputs/inline-autocomplete";
import { useState } from "react";

export type RenderCellControlProps = {
    rowId: string, columnId: string, value: any;
    columnConfigs: ColumnSlice,
    speciesOptions: {
        label: string;
        value: string;
    }[],
    serotypeOptions: {
        label: string;
        value: string;
    }[],
    onAutocompleteEdit: (rowId: string, field: string) => (val: any) => void,
    onFreeTextEdit: (rowId: string, field: string) => (val: string) => void,
    rowUpdating: (id: any) => boolean,
    cellUpdating: (id: any, column: any) => boolean,
    approvals: unknown,
    displayData: AnalysisResult[],
    user: UserInfo,
}

const global_editing_cb: Map<string, ((a: number) => void)[]> = new Map()

export const RenderCellControl = (props: RenderCellControlProps) => {
    const { approvals, cellUpdating, columnConfigs, columnId, displayData, onAutocompleteEdit, onFreeTextEdit, rowId, rowUpdating, serotypeOptions, speciesOptions, user, value } = props;

    const [editReasonCount, setEditReasonCount] = useState(0);

    useEffect(() => {
        if (global_editing_cb.has(rowId)) {
            global_editing_cb.get(rowId).push(setEditReasonCount);
        } else {
            global_editing_cb.set(rowId,[setEditReasonCount])
        }
        return () => {
            global_editing_cb.set(rowId, global_editing_cb.get(rowId).filter(cb => cb != setEditReasonCount))
        }
    },[setEditReasonCount])

    const incrementEditReason = useCallback(() => {
        global_editing_cb.get(rowId).forEach(cb => cb(editReasonCount+1))
    },[editReasonCount])

    
    const decrementEditReason = useCallback(() => {
        global_editing_cb.get(rowId).forEach(cb => cb(editReasonCount-1))
    },[editReasonCount])

    const isEditing = editReasonCount > 0;

    const rowInstitution = displayData.find((row) => row.sequence_id == rowId)
        .institution;
    const editIsAllowed =
        columnConfigs[columnId].editable ||
        user.institution == rowInstitution ||
        columnConfigs[columnId].cross_org_editable ||
        user.data_clearance === "all";

    if (value !== 0 && value !== false && !value && !editIsAllowed) {
        return <div />;
    }
    let v = `${value}`;
    if (v === "Invalid Date") {
        return <div />;
    }
    else if (value instanceof Date) {
        // Fancy libraries could be used, but this will do the trick just fine
        v = value.toISOString().split("T")[0];
    } else if (
        (columnId.toLowerCase().startsWith("date") ||
            columnId.toLowerCase().endsWith("date")) &&
        value !== undefined
    ) {
        if (
            typeof value?.getTime === "function" &&
            !Number.isNaN(value?.getTime())
        ) {
            v = value?.toISOString()?.split("T")[0];
        } else {
            v = value?.split("T")[0];
        }
    } else if (typeof value === "object") {
        v = `${JSON.stringify(value)}`;
        if (columnId === "qc_failed_tests") {
            v = (value as Array<AnalysisResultAllOfQcFailedTests>).reduce(
                (acc, x) => {
                    if (acc !== "") {
                        acc += ", ";
                    }
                    acc += `${x.display_name}: ${x.reason}`;
                    return acc;
                },
                ""
            );
        }
        if (columnId === "st_alleles") {
            v = Object.entries(value).reduce((acc, [k, val]) => {
                if (acc !== "") {
                    acc += ", ";
                }
                acc += `${k}: ${val}`;
                return acc;
            }, "");
        }
    }

    // cannot edit cells that have already been approved
    if (approvals?.[rowId]?.[columnId] !== ApprovalStatus.approved) {
        if (columnId === "species_final") {
            return (
                <InlineAutoComplete
                    options={speciesOptions}
                    onChange={onAutocompleteEdit(rowId, columnId)}
                    defaultValue={v}
                    isLoading={rowUpdating(rowId)}
                />
            );
        }
        if (columnId === "serotype_final") {
            return (
                <InlineAutoComplete
                    options={serotypeOptions}
                    onChange={onAutocompleteEdit(rowId, columnId)}
                    defaultValue={v}
                    isLoading={rowUpdating(rowId)}
                />
            );
        }

        if (editIsAllowed) {
            return <div
                onMouseEnter={incrementEditReason}
                onMouseLeave={decrementEditReason}

                style={{ flexGrow: 1, minWidth: "100%", minHeight: "100%" }}>
                {!isEditing && <>{value || value === 0 ? v : ""}</>}
                {isEditing && <Editable
                    minW="100%"
                    minH="100%"
                    defaultValue={value || value === 0 ? v : ""}
                    submitOnBlur={false}
                    onSubmit={onFreeTextEdit(rowId, columnId)}
                    
                >
                    <EditablePreview
                        height="100%"
                        minWidth="400px"
                        minHeight="22px"
                        
                    />
                    {columnConfigs[columnId].editable_format === "date" ? (
                        <EditableInput
                            pattern="\d{4}-\d{1,2}-\d{1,2}"
                            title="Date in yyyy-mm-dd format"
                            height="100%"
                            minWidth="100%"
                            
                        />
                    ) : columnConfigs[columnId].editable_format === "number" ? (
                        <EditableInput
                            pattern="\d+"
                            type="numeric"
                            height="100%"
                            width="100%"
                        />
                    ) : (
                        <EditableInput height="100%" width="100%"/>
                    )}
                </Editable>}
            </div>;
        }
    }
    return <div >{value || value === 0 ? v : ""}</div>;
};