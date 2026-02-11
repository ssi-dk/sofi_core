import { AnalysisResult } from "sap-client";
import { DataTableSelection } from "./data-table/data-table";
import { HamburgerIcon, SmallCloseIcon, SmallAddIcon } from "@chakra-ui/icons";
import { ResistanceMenuItem } from "./resistance/resistance-menu-item";
import { NearestNeighborMenuItem } from "./nearest-neighbor/nearest-neighbor-menu-item";
import { Menu, MenuList, MenuButton, Button, MenuItem } from "@chakra-ui/react";
import { useCallback } from "react";
import {
  clearSelection,
  selectAllInView,
  selectAllThunk,
} from "./analysis-selection-configs";
import { useDispatch } from "react-redux";
import { SendToWorkspaceMenuItem } from "app/workspaces/send-to-workspace-menu-item";
import { AnalysisQuery } from "sap-client";

type Props = {
  selection: DataTableSelection<AnalysisResult>;
  isNarrowed: boolean;
  data: AnalysisResult[];
  search: (query: AnalysisQuery, pageSize: number) => void;
  lastSearchQuery: AnalysisQuery;
};

export const AnalysisSelectionMenu = (props: Props) => {
  const { selection, isNarrowed, data, search, lastSearchQuery } = props;
  const dispatch = useDispatch();

  const onClear = useCallback(() => {
    dispatch(clearSelection());
  }, [dispatch]);

  const disabled = isNarrowed || Object.keys(selection).length == 0;

  return (
    <div>
      <Menu>
        <MenuButton as={Button} leftIcon={<HamburgerIcon />}>
          Selection
        </MenuButton>
        <MenuList>
          <ResistanceMenuItem selection={selection} disabled={disabled} />
          <NearestNeighborMenuItem selection={selection} disabled={disabled} />
          {/* <SendToWorkspaceMenuItem selection={selection} disabled={disabled} /> */}
          <MenuItem
            aria-label="Clear Selection"
            title="Clear Selection"
            icon={<SmallCloseIcon />}
            onClick={onClear}
            isDisabled={disabled}
          >
            Clear Selection
          </MenuItem>
        </MenuList>
      </Menu>
    </div>
  );
};
