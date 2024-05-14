import { AnalysisResult } from "sap-client";
import { DataTableSelection } from "./data-table/data-table";
import { HamburgerIcon } from "@chakra-ui/icons";
import { ResistanceMenuItem } from "./resistance/resistance-menu-item";
import { NearestNeighborMenuItem } from "./nearest-neighbor/nearest-neighbor-menu-item";
import { Menu, MenuList, MenuButton, Button } from "@chakra-ui/react";

type Props = {
  selection: DataTableSelection<AnalysisResult>;
  isNarrowed: boolean;
};

export const AnalysisSelectionMenu = (props: Props) => {
  const { selection, isNarrowed } = props;

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
        </MenuList>
      </Menu>
    </div>
  );
};
