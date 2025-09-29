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
import { BulkMetadataRequest } from "sap-client";
import { useMutation } from "redux-query-react";
import { useTranslation } from "react-i18next";
import { uploadBulkMetadata } from "./manual-upload-configs";

export default function BulkUploadForm() {
  const [formDisabled, setFormDisabled] = useState(true);
  const { t } = useTranslation();
  const toast = useToast();
  const [
    { isPending, status },
    doUpload,
  ] = useMutation((payload: BulkMetadataRequest) =>
    uploadBulkMetadata(payload)
  );

  const [path, setPath] = useState<any>(null);
  const [metadataTsv, setMetadataTsv] = useState<any>(null);

  // Display toast
  React.useMemo(() => {
    if (status >= 200 && status < 299) {
      toast({
        title: t("Isolate metadata uploaded"),
        description: `Metadata has been successfully uploaded!`,
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    } else if (status != null) {
      setPath(null);
      setMetadataTsv(null);
      toast({
        title: t("Failed isolate metadata upload"),
        description: `Metadata failed to be uploaded. Check required fields and error log to the left.`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [t, toast, status, setPath, setMetadataTsv]);

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

  const onPathChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setPath(e.target.value),
    [setPath]
  );

  const onFilesChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        setMetadataTsv(files[0]);
      } else {
        setMetadataTsv(null);
      }
    },
    [setMetadataTsv]
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
          This upload form is only to supply SOFI with metadata after manual
          SFTP/SCP upload directy into bifrost (in appropriate locations)
        </Text>
        <FormControl isRequired id="path">
          <FormLabel>Upload directory</FormLabel>
          <Input type="text" onChange={onPathChange} name="path" />
        </FormControl>
        <FormControl isRequired id="metadata_file">
          <FormLabel>Metadata TSV file</FormLabel>
          <Input type="file" onChange={onFilesChange} name="metadata_file" />
        </FormControl>
        <Button type="submit" onClick={submitForm} disabled={formDisabled}>
          Submit
        </Button>
      </VStack>
    </form>
  );
}
