import { AnalysisResult } from "sap-client";
import { DataTableSelection } from "./data-table/data-table";
import { HamburgerIcon, SmallCloseIcon } from "@chakra-ui/icons";
import { ResistanceMenuItem } from "./resistance/resistance-menu-item";
import { NearestNeighborMenuItem } from "./nearest-neighbor/nearest-neighbor-menu-item";
import { Menu, MenuList, MenuButton, Button, MenuItem } from "@chakra-ui/react";
import { useCallback } from "react";
import { clearSelection } from "./analysis-selection-configs";
import { useDispatch } from "react-redux";

type Props = {
  selection: DataTableSelection<AnalysisResult>;
  isNarrowed: boolean;
};

export const AnalysisSelectionMenu = (props: Props) => {
  const { selection, isNarrowed } = props;
  const dispatch = useDispatch();

  const onClear = useCallback(() => {
    dispatch(clearSelection());
  }, [dispatch]);

  return (
    <div>
      <Menu>
        <MenuButton
          as={Button}
          leftIcon={<HamburgerIcon />}
          disabled={isNarrowed || Object.keys(selection).length == 0}
        >
          Selection
        </MenuButton>
        <MenuList>
          <ResistanceMenuItem selection={selection} />
          <NearestNeighborMenuItem selection={selection} />
          <MenuItem
            aria-label="Clear Selection"
            title="Clear Selection"
            icon={<SmallCloseIcon />}
            onClick={onClear}
          >
            Clear Selection
          </MenuItem>
        </MenuList>
      </Menu>
    </div>
  );
};
