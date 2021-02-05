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

export default function BulkUploadForm() {
  const [loading, setLoading] = useState<boolean>(false);

  return loading ? (
    <Loading />
  ) : (
    <VStack>
      <Text>
        This upload form is only to supply SOFI with metadata after manual
        SFTP/SCP upload directy into bifrost (in appropriate locations)
      </Text>
      <FormControl id="metadata_file">
        <FormLabel>Metadata TSV file</FormLabel>
        <Input type="file" name="metadata_file" />
      </FormControl>
      <Button type="submit">Submit</Button>
    </VStack>
  );
}
