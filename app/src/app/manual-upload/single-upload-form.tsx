import React, { useRef, useState } from "react";
import {
  VStack,
  Input,
  Button,
  Text,
  FormLabel,
  FormControl,
  useToast,
} from "@chakra-ui/react";
import { BaseMetadata } from "sap-client/models/BaseMetadata";
import { Organization } from "sap-client/models/Organization";
import { SingleUploadRequest } from "sap-client/apis/UploadApi";
import { Loading } from "loading";
import { useMutation } from "redux-query-react";
import { useTranslation } from "react-i18next";
import { uploadIsolateFile } from "./manual-upload-configs";
import TextInput from "./text-input";

const initialState = {
  isolate_id: "",
  sequence_id: "",
  project_number: 2,
  project_title: "Urgent Inquiries",
  sampling_date: new Date(),
  received_date: new Date(),
  run_id: "",
  _public: "",
  provided_species: "",
  primary_isolate: true,
} as BaseMetadata;

function SingleUploadForm() {
  const [formDisabled, setFormDisabled] = useState(true);
  const { t } = useTranslation();
  const toast = useToast();

  const [
    { isPending, status },
    doUpload,
  ] = useMutation((payload: SingleUploadRequest) => uploadIsolateFile(payload));

  const [selectedFiles, setSelectedFile] = useState<any>(null);

  const [metadata, setMetadata] = React.useState(initialState);

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
      setMetadata(initialState);
    } else if (status != null) {
      setSelectedFile(null);
      setFormDisabled(true);
      toast({
        title: t("Failed isolate upload"),
        description: `Isolate failed to be uploaded. Check required fields and error log to the left.`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [t, toast, status, setMetadata, setSelectedFile, setFormDisabled]);

  const changeState = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value, name } = e.target;
      setMetadata({
        ...metadata,
        [name]: value,
      });
    },
    [setMetadata, metadata]
  );

  const changeFile = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      // eslint-disable-next-line
      setSelectedFile(e.target.files),
    [setSelectedFile]
  );

  const toggleSubmit = React.useCallback(
    (e) => {
      const valid = e?.currentTarget?.checkValidity();
      setFormDisabled(!valid);
    },
    [setFormDisabled]
  );

  const submitForm = React.useCallback(
    (e) => {
      e.preventDefault();
      doUpload({
        metadata,
        files: selectedFiles,
      });
    },
    [selectedFiles, metadata, doUpload]
  );

  return isPending ? (
    <Loading />
  ) : (
    <form onChange={toggleSubmit}>
      <VStack>
        <Text>Upload single sequence file.</Text>
        <TextInput
          isRequired
          label="Isolate ID"
          name="isolate_id"
          value={metadata.isolate_id}
          onChange={changeState}
        />
        <TextInput
          isRequired
          label="Sequence ID"
          name="sequence_id"
          value={metadata.sequence_id}
          onChange={changeState}
        />
        <TextInput
          isRequired
          label="Project Number"
          name="project_number"
          value={metadata.project_number}
          onChange={changeState}
        />
        <TextInput
          isRequired
          label="Project Title"
          name="project_title"
          value={metadata.project_title}
          onChange={changeState}
        />
        <TextInput
          label="Sampling Date"
          name="sampling_date"
          value={metadata.sampling_date}
          onChange={changeState}
        />
        <TextInput
          label="Received Date"
          name="received_date"
          value={metadata.received_date}
          onChange={changeState}
        />
        <TextInput
          label="Run id"
          name="run_id"
          value={metadata.run_id}
          onChange={changeState}
        />
        <TextInput
          label="Public"
          name="_public"
          // eslint-disable-next-line
          value={metadata._public}
          onChange={changeState}
        />
        <TextInput
          label="Provided species"
          name="provided_species"
          value={metadata.provided_species}
          onChange={changeState}
        />
        <TextInput
          label="Primary isolate?"
          name="primary_isolate"
          value={metadata.primary_isolate}
          onChange={changeState}
        />
        <FormControl id="files" isRequired>
          <FormLabel>Gzipped fastq sequence pair (select one pair)</FormLabel>
          <Input type="file" onChange={changeFile} multiple />
        </FormControl>
        <Button type="submit" onClick={submitForm} disabled={formDisabled}>
          Upload
        </Button>
      </VStack>
    </form>
  );
}

export default React.memo(SingleUploadForm);
