import React, { useState } from "react";
import {
  VStack,
  Input,
  Button,
  Text,
  FormLabel,
  FormControl,
} from "@chakra-ui/react";
import { BaseMetadata } from "sap-client/models/BaseMetadata";
import { Organization } from "sap-client/models/Organization";
import { SingleUploadRequest } from "sap-client/apis/UploadApi";
import { Loading } from "loading";
import { useMutation } from "redux-query-react";
import { uploadIsolateFile } from "./manual-upload-configs";
import TextInput from "./text-input";

function SingleUploadForm() {
  const [
    { isPending },
    doUpload,
  ] = useMutation((payload: SingleUploadRequest) => uploadIsolateFile(payload));

  const [selectedFiles, setSelectedFile] = useState<any>(null);

  const [metadata, setMetadata] = React.useState({
    isolate_id: "",
    sequence_id: "",
    sequence_filename: "",
    institution: Organization.Other,
    project_number: 0,
    project_title: "",
    sampling_date: new Date(),
    received_date: new Date(),
    run_id: "",
    _public: "",
    provided_species: "",
    primary_isolate: true,
  } as BaseMetadata);

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
    <VStack>
      <Text>Upload single sequence file.</Text>
      <TextInput
        label="Isolate ID"
        name="isolate_id"
        value={metadata.isolate_id}
        onChange={changeState}
      />
      <TextInput
        label="Sequence ID"
        name="sequence_id"
        value={metadata.sequence_id}
        onChange={changeState}
      />
      <TextInput
        label="sequence_filename"
        name="sequence_filename"
        value={metadata.sequence_filename}
        onChange={changeState}
      />
      <TextInput
        label="Institution"
        name="institution"
        value={metadata.institution}
        onChange={changeState}
      />
      <TextInput
        label="Project Number"
        name="project_number"
        value={metadata.project_number}
        onChange={changeState}
      />
      <TextInput
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
      <FormControl id="files">
        <FormLabel>Gzipped fastq sequences (select multiple)</FormLabel>
        <Input type="file" onChange={changeFile} multiple />
      </FormControl>
      <Button type="submit" onClick={submitForm}>
        Upload
      </Button>
    </VStack>
  );
}

export default React.memo(SingleUploadForm);
