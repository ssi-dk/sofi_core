import React, { useMemo, useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  VStack,
} from "@chakra-ui/react";

type BulkSearchModalProps = {
  isOpen: boolean;
  onClose: () => void;
  searchTerms: Set<string>;
  currentQuery: string;
  onQueryGenerated: (query: string) => void;
};

const BulkSearchModal = ({
  isOpen,
  onClose,
  searchTerms,
  currentQuery,
  onQueryGenerated,
}: BulkSearchModalProps) => {

  const [fieldInput, setFieldInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const matchingFields = useMemo(
    () =>
      Array.from(searchTerms)
        .filter((field) =>
          field.toLowerCase().includes(fieldInput.toLowerCase())
        )
        .slice(0, 10),
    [fieldInput, searchTerms]
  );

  const onAdd = async () => {
    if (!fieldInput || !file) {
      return;
    }

    const text = await file.text();

    const values = text
      .split(/\r?\n/)
      .filter((value) => value.length > 0);

    const clause = `${fieldInput}:"${values.join(",")}"`;

    const nextQuery =
      currentQuery.trim().length === 0
        ? clause
        : `${currentQuery} AND ${clause}`;

    onQueryGenerated(nextQuery);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />

      <ModalContent>
        <ModalHeader>Bulk Search</ModalHeader>

        <ModalBody>
          <VStack align="stretch" spacing={4}>
            <FormControl>
              <FormLabel>Field</FormLabel>

              <Popover              
                isOpen={
                  isFocused &&
                  fieldInput.length > 0
                }
                placement="bottom-start"
                autoFocus={false}                
              >
                <PopoverTrigger>
                  <Input
                    placeholder="Search field..."
                    value={fieldInput}
                    onChange={(e) =>
                      setFieldInput(e.target.value)
                    }                    
                     onFocus={() => setIsFocused(true)}
                     onBlur={() => setIsFocused(false)}
                  />
                </PopoverTrigger>

                <PopoverContent>
                  <PopoverBody p={0}>
                    <VStack spacing={0} align="stretch">
                      {matchingFields.map((field) => (
                        <Box
                          key={field}
                          p={2}
                          cursor="pointer"
                          _hover={{ bg: "gray.100" }}
                          onClick={() => {
                            setFieldInput(field);
                            setIsFocused(false);
                          }}
                        >
                          {field}
                        </Box>
                      ))}
                    </VStack>
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            </FormControl>

            <FormControl>
              <FormLabel>File</FormLabel>

              <Input
                type="file"              
                accept=".txt"
                alignContent="center"
                onChange={(e) =>
                  setFile(e.target.files?.[0] ?? null)
                }
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button mr={3} variant="ghost" onClick={onClose}>
            Cancel
          </Button>

          <Button
            colorScheme="blue"
            onClick={onAdd}
            isDisabled={
              !searchTerms.has(fieldInput) || !file
            }
          >
            Add to query
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default React.memo(BulkSearchModal);