import React from "react";
import { MenuItem } from "@chakra-ui/react";
import { AnalysisResult } from "sap-client";
import { DataTableSelection } from "../data-table/data-table";
import { useDisclosure } from "@chakra-ui/react";
import { PlusSquareIcon } from "@chakra-ui/icons";
import { NearestNeighborModal } from "./nearest-neighbor-modal";

type Props = {
  selection: DataTableSelection<AnalysisResult>;
  disabled: boolean;
};

export const NearestNeighborMenuItem = (props: Props) => {
  const { selection, disabled } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      {isOpen ? (
        <NearestNeighborModal selection={selection} onClose={onClose} />
      ) : null}
      <MenuItem
        aria-label="Nearest Neighbor"
        title="Nearest Neighbor"
        icon={<PlusSquareIcon />}
        onClick={onOpen}
        isDisabled={disabled}
      >
        Nearest Neighbor
      </MenuItem>
    </>
  );
};
