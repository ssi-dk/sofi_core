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
import { BulkMetadataRequest } from "sap-client";
import { useMutation } from "redux-query-react";
import { uploadBulkMetadata } from "./manual-upload-configs";

export default function BulkUploadForm() {
  const [
    { isPending },
    doUpload,
  ] = useMutation((payload: BulkMetadataRequest) =>
    uploadBulkMetadata(payload)
  );

  const [path, setPath] = useState<any>(null);
  const [metadataTsv, setMetadataTsv] = useState<any>(null);

  const submitForm = React.useCallback(
    (e) => {
      e.preventDefault();
      doUpload({
        path,
        metadataTsv,
      });
    },
    [path, metadataTsv, doUpload]
  );

  return isPending ? (
    <Loading />
  ) : (
    <VStack>
      <Text>
        This upload form is only to supply SOFI with metadata after manual
        SFTP/SCP upload directy into bifrost (in appropriate locations)
      </Text>
      <FormControl id="path">
        <FormLabel>Upload directory</FormLabel>
        <Input
          type="text"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPath(e.target.value)
          }
          name="path"
        />
      </FormControl>
      <FormControl id="metadata_file">
        <FormLabel>Metadata TSV file</FormLabel>
        <Input
          type="file"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setMetadataTsv(e.target.files![0])
          }
          name="metadata_file"
        />
      </FormControl>
      <Button type="submit" onClick={submitForm}>
        Submit
      </Button>
    </VStack>
  );
}
