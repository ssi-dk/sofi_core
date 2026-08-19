import React, { useMemo, useState } from "react";
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
  Tag,
  TagLabel,
  Wrap,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem

} from "@chakra-ui/react";

type BulkSearchModalProps = {
  isOpen: boolean;
  onClose: () => void;
  searchTerms: Set<string>;
  currentQuery: string;
  onQueryGenerated: (query: string) => void;
};

const MAX_SUGGESTIONS = 10;
const MAX_PREVIEWS = 10;

const BulkSearchModal = ({
  isOpen,
  onClose,
  searchTerms,
  currentQuery,
  onQueryGenerated,
}: BulkSearchModalProps) => {
  const [selectedField, setSelectedField] = useState("");
  const [isSelectFieldFocused, setIsSelectFieldFocused] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [values, setValues] = useState<string[]>([]);

  const hasExistingQuery = currentQuery.trim().length > 0;
  const canAdd = searchTerms.has(selectedField) && values.length > 0;
  const previewValues = values.slice(0, MAX_PREVIEWS);

  const matchingFields = useMemo(
    () =>
      Array.from(searchTerms)
        .filter((field) =>
          field.toLowerCase().includes(selectedField.toLowerCase())
        )
        .slice(0, MAX_SUGGESTIONS),
    [selectedField, searchTerms]
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;
    setFile(selectedFile);

    if (!selectedFile) {
      setValues([]);
      return;
    }

    const text = await selectedFile.text();

    setValues(
      text
        .split(/\r?\n/)
        .map((v) => v.trim())
        .filter(Boolean)
    );
  };

  const buildClause = () =>
    `${selectedField}:"[${values.join(",")}]"`;

  const addClause = (operator: "AND" | "OR") => {
    const clause = buildClause();

    const newQuery =
      currentQuery.trim().length === 0
        ? clause
        : `${currentQuery} ${operator} ${clause}`;

    onQueryGenerated(newQuery);
    resetForm();
    onClose();
  };

  const applyQuery = () => {
    onQueryGenerated(buildClause());
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setSelectedField("");
    setFile(null);
    setValues([]);
    setIsSelectFieldFocused(false);
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
                  isSelectFieldFocused &&
                  selectedField.length > 0
                }
                placement="bottom-start"
                autoFocus={false}
              >
                <PopoverTrigger>
                  <Input
                    placeholder="Search field..."
                    value={selectedField}
                    onChange={(e) =>
                      setSelectedField(e.target.value)
                    }
                    onFocus={() => setIsSelectFieldFocused(true)}
                    onBlur={() => setIsSelectFieldFocused(false)}
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
                            setSelectedField(field);
                            setIsSelectFieldFocused(false);
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
                cursor="pointer"
                onChange={handleFileChange}
              />
            </FormControl>

            {file && (
              <Box
                p={3}
                borderWidth="1px"
                borderRadius="md"
                bg="gray.50"
              >
                <Text fontWeight="bold">{file.name}</Text>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  {values.length} values found
                </Text>

                <Wrap spacing={2}>
                  {previewValues.map((value) => (
                    <Tag key={value} size="sm" colorScheme="blue">
                      <TagLabel>{value}</TagLabel>
                    </Tag>
                  ))}

                  {values.length > MAX_PREVIEWS && (
                    <Tag size="sm" variant="subtle">
                      <TagLabel>
                        +{values.length - MAX_PREVIEWS} more
                      </TagLabel>
                    </Tag>
                  )}
                </Wrap>
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button mr={3} variant="ghost" onClick={onClose}>
            Cancel
          </Button>

          {hasExistingQuery ? (
            <Menu>
              <MenuButton as={Button} isDisabled={!canAdd}>
                Add to query
              </MenuButton>

              <MenuList>
                <MenuItem onClick={() => addClause("AND")}>
                  Add with AND
                </MenuItem>

                <MenuItem onClick={() => addClause("OR")}>
                  Add with OR
                </MenuItem>

                <MenuItem onClick={() => applyQuery()}>
                  Replace query
                </MenuItem>
              </MenuList>
            </Menu>
          ) : (
            < Button
              colorScheme="blue"
              onClick={applyQuery}
              isDisabled={!canAdd}
            >
              Add to query
            </Button>)}
        </ModalFooter>
      </ModalContent>
    </Modal >
  );
};

export default React.memo(BulkSearchModal);