import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Box,
  Flex,
  Editable,
  EditablePreview,
  EditableInput,
  Skeleton,
  useToast,
  Button,
  IconButton,
  Menu, 
  MenuList, 
  MenuButton, 
  MenuItem,
  Input,
  InputProps
} from "@chakra-ui/react";
import {
  AnalysisResult,
  AnalysisQuery,
  ApprovalStatus,
  UserInfo,
  QueryExpression,
  QueryOperator,
  QueryOperand,
  FilterOptions,
  AnalysisSorting,
  Workspace,
} from "sap-client";
import { HamburgerIcon, AddIcon, EditIcon, DeleteIcon, CheckIcon, MinusIcon, NotAllowedIcon } from "@chakra-ui/icons";
import DataTable, {
  ColumnReordering,
  DataTableSelection,
} from "./data-table/data-table";

export type WorkspaceMenuProps = {
    workspaces: Workspace[],
    workspace: Workspace,
    selection: DataTableSelection<AnalysisResult>,
    addToWorkspace: (id: string) => void,
    removeFromWorkspace: (id: string) => void,
    setWorkspace: (w: Workspace) => void,
}

export const WorkspaceMenu = (props: WorkspaceMenuProps) => {
    const {workspaces, workspace, selection, addToWorkspace, removeFromWorkspace,setWorkspace} = props;


    const [searchStr, setSearchStr] = useState("");
    return <Menu >
        <MenuButton style={{ minWidth: "8rem" }} marginX={2} paddingX={2} as={Button} leftIcon={<HamburgerIcon />}>
            Workspaces
        </MenuButton>
        <MenuList>
            <Input variant="outline" placeholder="Search for workspaces" onChange={setSearchStr}  />
            {workspaces.map(w => {

                const fullySelected = Object.values(selection).map(sv => sv.original.id).every(id => w.samples.find(sid => sid === id));

                const isCurrent = w.id === workspace?.id;

                const wsStyle = isCurrent ? {backgroundColor: "#DDE3E7", borderRadius: "6px"}: undefined;

                return (<div key={w.id} style={wsStyle} >
                    <div style={{ display: "flex", width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <Button style={{flexGrow: 1, margin: "4px"}} onClick={() => {
                            setWorkspace(w);
                        }}>
                            {w.name}
                        </Button>
                        <div>
                            {Object.values(selection).length > 0 && <>
                                <IconButton disabled={fullySelected} marginX={1} onClick={(e) => {
                                    addToWorkspace(w.id);
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                                    icon={fullySelected ? <CheckIcon /> : <AddIcon />} 
                                />
                                <IconButton disabled={!fullySelected} marginX={1} onClick={(e) => {
                                    removeFromWorkspace(w.id);
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                                    icon={fullySelected ? <MinusIcon/> : <NotAllowedIcon />} 
                                />
                            </>}
                            <EditIcon margin={2} />
                            <DeleteIcon margin={2} />
                        </div>
                    </div>
                </div>)
            }
            )}
        </MenuList>

    </Menu>
}