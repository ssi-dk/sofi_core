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
        select multiple gzipped sequence files to upload.
      </Text>
      <FormControl id="metadata_tsv">
        <FormLabel>Metadata TSV file</FormLabel>
        <Input
          type="file"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setMetadataTSV(e.target.files![0])
          }
          name="metadata_tsv"
        />
      </FormControl>
      <FormControl id="files">
        <FormLabel>Gzipped sequences (select multiple)</FormLabel>
        <Input
          type="file"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSelectedFiles(e.target.files)
          }
          name="files"
          multiple
        />
      </FormControl>
      <Button type="submit" onClick={submitForm}>Submit</Button>
    </VStack>
  );
}
