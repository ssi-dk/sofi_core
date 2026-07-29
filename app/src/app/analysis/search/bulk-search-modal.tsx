// import React, { useMemo, useState } from "react";
// import {
//     Box,
//     Button,
//     FormControl,
//     FormLabel,
//     Input,
//     Modal,
//     ModalBody,
//     ModalCloseButton,
//     ModalContent,
//     ModalFooter,
//     ModalHeader,
//     ModalOverlay,
//     Select,
//     Text,
//     useToast,
//     VStack,
// } from "@chakra-ui/react";

// type BulkSearchModalProps = {
//     isOpen: boolean;
//     onClose: () => void;
//     searchTerms: Set<string>;
//     currentQuery: string;
//     onQueryGenerated: (query: string) => void;
// };

// // const escapeLuceneValue = (value: string): string => {
// //   return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
// // };

// // const buildBulkSearchClause = (field: string, values: string[]): string => {
// //   return `(${values
// //     .map((value) => `${field}:"${escapeLuceneValue(value)}"`)
// //     .join(" OR ")})`;
// // };

// // const parseValuesFromFile = async (file: File): Promise<string[]> => {
// //   const text = await file.text();

// //   const values = text
// //     .split(/\r?\n/)
// //     .map((value) => value.trim())
// //     .filter(Boolean);

// //   return Array.from(new Set(values));
// // };
// const BulkSearchModal = ({
//     isOpen,
//     onClose,
//     searchTerms,
//     currentQuery,
//     onQueryGenerated,
// }: BulkSearchModalProps) => {
//     const [field, setField] = useState("");
//     const [file, setFile] = useState<File | null>(null);

//     const onAdd = async () => {
//         if (!field || !file) {
//             return;
//         }

//         const text = await file.text();

//         const values = text
//             .split(/\r?\n/)
//             .filter(Boolean);

//         const clause = values
//             .map(v => `${field}:"${v}"`)
//             .join(" OR ");

//         const nextQuery =
//             currentQuery.length === 0
//                 ? `(${clause})`
//                 : `${currentQuery} AND (${clause})`;

//         onQueryGenerated(nextQuery);
//         onClose();
//     };

//     return (
//         <Modal isOpen={isOpen} onClose={onClose}>
//             <ModalOverlay />
//             <ModalContent>
//                 <ModalHeader>Bulk Search</ModalHeader>
//                 <ModalBody>                 
//                     {/* <VStack align="stretch">
//                         <Select
//                             placeholder="Select field"
//                             value={field}
//                             onChange={(e) => setField(e.target.value)}
//                         >
//                             {Array.from(searchTerms).map(term => (
//                                 <option key={term} value={term}>
//                                     {term}
//                                 </option>
//                             ))}
//                         </Select>

//                         <Input
//                             type="file"
//                             accept=".txt"
//                             onChange={(e) =>
//                                 setFile(e.target.files?.[0] ?? null)
//                             }
//                         />
//                     </VStack> */}
//                 </ModalBody>

//                 <ModalFooter>
//                     <Button onClick={onAdd}>
//                         Add to query
//                     </Button>
//                 </ModalFooter>
//             </ModalContent>
//         </Modal>
//     );
// };

// const BulkSearchModal = ({
//   isOpen,
//   onClose,
//   searchTerms,
//   currentQuery,
//   onQueryGenerated,
// }: BulkSearchModalProps) => {
//   const toast = useToast();

//   const fields = useMemo(
//     () => Array.from(searchTerms).sort(),
//     [searchTerms]
//   );

//   const [selectedField, setSelectedField] = useState("");
//   const [fileName, setFileName] = useState("");
//   const [values, setValues] = useState<string[]>([]);

//   const reset = () => {
//     setSelectedField("");
//     setFileName("");
//     setValues([]);
//   };

//   const handleClose = () => {
//     reset();
//     onClose();
//   };

//   const onFileChange = async (
//     event: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     const file = event.target.files?.[0];

//     if (!file) return;

//     try {
//       const parsedValues = await parseValuesFromFile(file);

//       setFileName(file.name);
//       setValues(parsedValues);

//       if (parsedValues.length === 0) {
//         toast({
//           title: "No values found",
//           description: "The file did not contain any newline-separated values.",
//           status: "warning",
//           isClosable: true,
//         });
//       }
//     } catch (error) {
//       toast({
//         title: "Could not read file",
//         description: `${error}`,
//         status: "error",
//         isClosable: true,
//       });
//     }

//     // Allows selecting the same file again
//     event.target.value = "";
//   };

//   const onAddToQuery = () => {
//     if (!selectedField) {
//       toast({
//         title: "Select a field",
//         status: "warning",
//         isClosable: true,
//       });
//       return;
//     }

//     if (values.length === 0) {
//       toast({
//         title: "Select a file",
//         description: "The file must contain at least one value.",
//         status: "warning",
//         isClosable: true,
//       });
//       return;
//     }

//     const clause = buildBulkSearchClause(selectedField, values);

//     const nextQuery =
//       currentQuery.trim().length === 0
//         ? clause
//         : `${currentQuery.trim()} AND ${clause}`;

//     onQueryGenerated(nextQuery);
//     handleClose();
//   };

//   return (
//     <Modal isOpen={isOpen} onClose={handleClose} size="lg">
//       <ModalOverlay />

//       <ModalContent>
//         <ModalHeader>Bulk search</ModalHeader>
//         <ModalCloseButton />

//         <ModalBody>
//           <VStack align="stretch" spacing={4}>
//             <FormControl>
//               <FormLabel>Field</FormLabel>
//               <Select
//                 placeholder="Select field"
//                 value={selectedField}
//                 onChange={(event) => setSelectedField(event.target.value)}
//               >
//                 {fields.map((field) => (
//                   <option key={field} value={field}>
//                     {field}
//                   </option>
//                 ))}
//               </Select>
//             </FormControl>

//             <FormControl>
//               <FormLabel>File</FormLabel>
//               <Input
//                 type="file"
//                 accept=".txt,.csv"
//                 onChange={onFileChange}
//               />
//             </FormControl>

//             {fileName && (
//               <Box borderWidth="1px" borderRadius="md" p={3}>
//                 <Text fontWeight="bold">{fileName}</Text>
//                 <Text color="gray.600">
//                   {values.length} unique values loaded
//                 </Text>
//               </Box>
//             )}

//             {selectedField && values.length > 0 && (
//               <Box
//                 borderWidth="1px"
//                 borderRadius="md"
//                 p={3}
//                 maxHeight="160px"
//                 overflowY="auto"
//                 bg="gray.50"
//               >
//                 <Text fontSize="sm" fontWeight="bold" mb={2}>
//                   Query preview
//                 </Text>
//                 <Text fontSize="sm" whiteSpace="pre-wrap">
//                   {buildBulkSearchClause(selectedField, values)}
//                 </Text>
//               </Box>
//             )}
//           </VStack>
//         </ModalBody>

//         <ModalFooter>
//           <Button variant="ghost" mr={3} onClick={handleClose}>
//             Cancel
//           </Button>

//           <Button
//             colorScheme="blue"
//             onClick={onAddToQuery}
//             isDisabled={!selectedField || values.length === 0}
//           >
//             Add to query
//           </Button>
//         </ModalFooter>
//       </ModalContent>
//     </Modal>
//   );
// };

//export default BulkSearchModal;

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