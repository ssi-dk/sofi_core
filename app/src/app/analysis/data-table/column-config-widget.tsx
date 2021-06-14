import React from "react";
import {
  Box,
  Divider,
  Heading,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Stack,
  useDisclosure,
} from "@chakra-ui/react";
import { SettingsIcon } from "@chakra-ui/icons";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";

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
