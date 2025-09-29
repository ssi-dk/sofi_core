import { useCallback, Fragment, FC } from "react";
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
  Stack,
  useDisclosure,
} from "@chakra-ui/react";
import { SettingsIcon } from "@chakra-ui/icons";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import { UserDefinedViewInternal } from "models/user-defined-view-internal";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "app/root-reducer";
import { toggleColumnVisibility } from "../view-selector/analysis-view-selection-config";

const Form: FC = ({ children }) => {
  return <Stack spacing={4}>{children}</Stack>;
};

type ColumnConfigWidgetProps = {
  onReorder: (
    sourceIdx: number,
    destinationIdx: number,
    draggableId: string
  ) => void;
};

export const ColumnConfigWidget: FC<ColumnConfigWidgetProps> = ({
  onReorder,
  children,
}) => {
  const { onOpen, onClose, isOpen } = useDisclosure();
  const dispatch = useDispatch();

  const view = useSelector<RootState>(
    (s) => s.view.view
  ) as UserDefinedViewInternal;

  const selectAllColumns = () => {
    view.hiddenColumns.forEach(hiddenId => {
         dispatch(toggleColumnVisibility(hiddenId))
    })
  };

  const deselectAllColumns = () => {
      const renderedColumns = children as { key: string }[]
      renderedColumns.forEach(r => {
        const key = r["key"]
        if (!view.hiddenColumns.find(c => c == key)) {
          dispatch(toggleColumnVisibility(key))
        }
      })
  };

  const onDragEnd = useCallback(
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
    <Fragment>
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
                      {(provided, _) => (
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
    </Fragment>
  );
};
