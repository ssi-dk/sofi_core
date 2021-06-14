import React, { useState } from "react";
import {
  VStack,
  Input,
  FormControl,
  FormLabel,
  Button,
  Text,
  useToast,
} from "@chakra-ui/react";
import { Loading } from "loading";
import { MultiUploadRequest } from "sap-client";
import { useMutation } from "redux-query-react";
import { useTranslation } from "react-i18next";
import { uploadMultipleIsolates } from "./manual-upload-configs";

export default function MultiUploadForm() {
  const [formDisabled, setFormDisabled] = useState(true);
  const { t } = useTranslation();
  const toast = useToast();

  const [
    { isPending, status },
    doUpload,
  ] = useMutation((payload: MultiUploadRequest) =>
    uploadMultipleIsolates(payload)
  );

  const [metadataTSV, setMetadataTSV] = useState<any>(null);
  const [selectedFiles, setSelectedFiles] = useState<any>(null);

  // Display toast
  React.useMemo(() => {
    if (status >= 200 && status < 299) {
      toast({
        title: t("Isolate uploaded"),
        description: `Isolate has been successfully uploaded!`,
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    } else if (status != null) {
      setSelectedFiles(null);
      setMetadataTSV(null);
      toast({
        title: t("Failed isolate upload"),
        description: `Isolate failed to be uploaded. Check required fields and error log to the left.`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [t, toast, status, setMetadataTSV, setSelectedFiles]);

  const metadataChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setMetadataTSV(e.target.files![0]),
    [setMetadataTSV]
  );
  const selectedFilesChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setSelectedFiles(e.target.files),
    [setSelectedFiles]
  );
  const submitForm = React.useCallback(
    (e) => {
      e.preventDefault();
      doUpload({
        metadataTsv: metadataTSV,
        files: selectedFiles,
      });
    },
    [metadataTSV, selectedFiles, doUpload]
  );

  const toggleSubmit = React.useCallback(
    (e) => {
      const valid = e?.currentTarget?.checkValidity();
      setFormDisabled(!valid);
    },
    [setFormDisabled]
  );

  return isPending ? (
    <Loading />
  ) : (
    <form onChange={toggleSubmit}>
      <VStack>
        <Text>
          Upload multiple sequence files with metadata. Supply a TSV file and
          select multiple gzipped sequence files to upload. Make sure to supply
          sequence filenames seperated by spaces. Example:
          &quot;sample1_reads_1.fastq.gz sample1_reads_2.fastq.gz&quot;
        </Text>
        <FormControl isRequired id="metadata_tsv">
          <FormLabel>Metadata TSV file</FormLabel>
          <Input type="file" onChange={metadataChange} name="metadata_tsv" />
        </FormControl>
        <FormControl isRequired id="files">
          <FormLabel>Gzipped fastq sequence pairs (select multiple)</FormLabel>
          <Input
            type="file"
            onChange={selectedFilesChange}
            name="files"
            multiple
          />
        </FormControl>
        <Button type="submit" onClick={submitForm} disabled={formDisabled}>
          Submit
        </Button>
      </VStack>
    </form>
  );
}
