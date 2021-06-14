import React, { useState } from "react";
import {
  VStack,
  Input,
  FormControl,
  FormLabel,
  Button,
  Text,
} from "@chakra-ui/react";
import { Loading } from "loading";
import { MultiUploadRequest } from "sap-client";
import { useMutation } from "redux-query-react";
import { uploadMultipleIsolates } from "./manual-upload-configs";

export default function MultiUploadForm() {
  const [{ isPending }, doUpload] = useMutation((payload: MultiUploadRequest) =>
    uploadMultipleIsolates(payload)
  );

  const [metadataTSV, setMetadataTSV] = useState<any>(null);
  const [selectedFiles, setSelectedFiles] = useState<any>(null);

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

  return isPending ? (
    <Loading />
  ) : (
    <VStack>
      <Text>
        Upload multiple sequence files with metadata. Supply a TSV file and
        select multiple gzipped sequence files to upload. Make sure to supply
        sequence filenames seperated by spaces. Example:
        &quot;sample1_reads_1.fastq.gz sample1_reads_2.fastq.gz&quot;
      </Text>
      <FormControl id="metadata_tsv">
        <FormLabel>Metadata TSV file</FormLabel>
        <Input type="file" onChange={metadataChange} name="metadata_tsv" />
      </FormControl>
      <FormControl id="files">
        <FormLabel>Gzipped fastq sequence pairs (select multiple)</FormLabel>
        <Input
          type="file"
          onChange={selectedFilesChange}
          name="files"
          multiple
        />
      </FormControl>
      <Button type="submit" onClick={submitForm}>
        Submit
      </Button>
    </VStack>
  );
}
