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

export default function MultiUploadForm() {
  const [loading, setLoading] = useState<boolean>(false);

  return loading ? (
    <Loading />
  ) : (
    <VStack>
      <Text>
        Upload multiple sequence files with metadata. Supply a TSV file and
        select multiple gzipped sequence files to upload.
      </Text>
      <FormControl id="metadata_file">
        <FormLabel>Metadata TSV file</FormLabel>
        <Input type="file" name="metadata_file" />
      </FormControl>
      <FormControl id="sequence_files">
        <FormLabel>Gzipped sequences (select multiple)</FormLabel>
        <Input type="file" name="sequence_files" multiple />
      </FormControl>
      <Button type="submit">Submit</Button>
    </VStack>
  );
}
