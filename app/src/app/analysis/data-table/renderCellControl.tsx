//   const renderCellControl = React.useCallback(
//     (rowId: string, columnId: string, value: any) => {
import React, { useEffect, useRef } from "react";
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

export const RenderCellControl = (props: RenderCellControlProps) => {
    const { approvals, cellUpdating, columnConfigs, columnId, displayData, onAutocompleteEdit, onFreeTextEdit, rowId, rowUpdating, serotypeOptions, speciesOptions, user, value } = props;

    const [isHover, setisHover] = useState(false);
    const [isContainerFocus, setIsContainerFocus] = useState(false);
    const [isInputFocus, setIsInputFocus] = useState(false);

    const isEditing = isContainerFocus || isHover || isInputFocus;

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        console.log("INPUT SET",value,inputRef.current)
    },[inputRef.current])

    useEffect(() => {
        if (isContainerFocus) {
            setTimeout(() => {
                console.log("SETTING FOCUS TO:",value,inputRef.current)
                inputRef.current?.focus();
                inputRef.current?.select();
            },500)
        }
    }, [isContainerFocus]);
    useEffect(() => {
        console.log("INPUT FOCUS CHANGED ",value, isInputFocus)
    }, [isInputFocus])

    if (cellUpdating(rowId, columnId)) {
        return <Skeleton width="100px" height="20px" />;
    }

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
            if (isEditing) {
                console.log("RENDERING",value)
            }

            return <div
                tabIndex={0}
                onMouseEnter={() => setisHover(true)}
                onMouseLeave={() => setisHover(false)}
                onFocus={() => setIsContainerFocus(true)}
                onBlur={() => setIsContainerFocus(false)}

                style={{ flexGrow: 1, minWidth: "100%", minHeight: "100%" }}>
                {!isHover && <>{value || value === 0 ? v : ""}</>}
                {isHover && <Editable
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
                            onFocus={() => setIsInputFocus(true)}
                            onBlur={() => setIsInputFocus(false)}
                            ref={inputRef}
                            pattern="\d{4}-\d{1,2}-\d{1,2}"
                            title="Date in yyyy-mm-dd format"
                            height="100%"
                            minWidth="100%"
                        />
                    ) : columnConfigs[columnId].editable_format === "number" ? (
                        <EditableInput
                            onFocus={() => setIsInputFocus(true)}
                            onBlur={() => setIsInputFocus(false)}
                            ref={inputRef}
                            pattern="\d+"
                            type="numeric"
                            height="100%"
                            width="100%"
                        />
                    ) : (
                        <EditableInput height="100%" width="100%" 
                            ref={inputRef} 
                            onFocus={() => setIsInputFocus(true)}
                            onBlur={() => setIsInputFocus(false)} />
                    )}
                </Editable>}
            </div>;
        }
    }
    return <div >{value || value === 0 ? v : ""}</div>;
};