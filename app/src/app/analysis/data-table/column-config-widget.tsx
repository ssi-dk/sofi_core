import React, { useCallback } from "react";
import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Spacer,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { SettingsIcon } from "@chakra-ui/icons";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import { UserDefinedViewInternal } from "models/user-defined-view-internal";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "app/root-reducer";
import { toggleColumnVisibility } from "../view-selector/analysis-view-selection-config";
import { ColumnSlice } from "../analysis-query-configs";

const Form: React.FC = ({ children }) => {
  return <Stack spacing={4}>{children}</Stack>;
};

type ColumnConfigWidgetProps = {
  onReorder: (
    sourceIdx: number,
    destinationIdx: number,
    draggableId: string
  ) => void;
};

export const ColumnConfigWidget: React.FC<ColumnConfigWidgetProps> = ({
  onReorder,
  children,
}) => {
  const { onOpen, onClose, isOpen } = useDisclosure();
  const dispatch = useDispatch();

  const view = useSelector<RootState>(
    (s) => s.view.view
  ) as UserDefinedViewInternal;

  const selectAllColumns = useCallback(() => {
    view.hiddenColumns.forEach(hiddenId => {
         dispatch(toggleColumnVisibility(hiddenId))
    })
  },[view.hiddenColumns.join()]) // Needs to join into string or it will not update, since array comparisons check for pointer equality

  const deselectAllColumns = useCallback(() => {
      const renderedColumns = children as {key: string}[]
      renderedColumns.forEach(r => {
        const key = r["key"]
        if (!view.hiddenColumns.find(c => c == key)) {
          dispatch(toggleColumnVisibility(key))
        }
      })

  },[view.hiddenColumns.join(), children])

  const onDragEnd = React.useCallback(
    (result: DropResult) => {
      if (!result.destination) {
        return;
      }
      onReorder(
        result.source.index,
        result.destination.index,
        result.draggableId
      );
    },
    [onReorder]
  );

  return (
    <React.Fragment>
      <Popover
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onClose}
        placement="left"
        closeOnBlur={false}
      >
        <PopoverTrigger>
          <IconButton
            aria-label="edit columns"
            size="sm"
            icon={<SettingsIcon />}
          />
        </PopoverTrigger>
        {isOpen && (
          <Portal>
            <PopoverContent p={5}>
              <PopoverArrow />
              <PopoverCloseButton />
              <Heading size="sm">Visible columns</Heading>
              <Flex direction="row" >
                <Button size="sm" marginRight={2} onClick={selectAllColumns}>Select all</Button>
                <Button size="sm" onClick={deselectAllColumns}>Deselect all</Button>
                
              </Flex>
              <Divider />
              <Box maxHeight="90vh" overflowY="auto">
                <Form>
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="columnDroppable">
                      {(provided, snapshot) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          {children}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </Form>
              </Box>
            </PopoverContent>
          </Portal>
        )}
      </Popover>
    </React.Fragment>
  );
};
