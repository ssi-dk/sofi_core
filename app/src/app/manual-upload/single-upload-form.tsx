import React, { useState } from "react";
import {
  VStack,
  Input,
  FormControl,
  FormLabel,
  Button,
  Text,
} from "@chakra-ui/react";
import { BaseMetadata } from "sap-client/models/BaseMetadata";
import { Organization } from "sap-client/models/Organization";
import { SingleUploadRequest } from "sap-client/apis/UploadApi";
import { Loading } from "loading";
import { useMutation } from "redux-query-react";
import { uploadIsolateFile } from "./manual-upload-configs";

export default function SingleUploadForm() {
  const [
    { isPending },
    doUpload,
  ] = useMutation((payload: SingleUploadRequest) => uploadIsolateFile(payload));

  const [selectedFile, setSelectedFile] = useState<any>(null);

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

  const changeState = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;
    setMetadata({
      ...metadata,
      [name]: value,
    });
  }, [setMetadata, metadata]);

  const submitForm = React.useCallback(
    (e) => {
      e.preventDefault();
      doUpload({
        metadata,
        file: selectedFile,
      });
    },
    [selectedFile, metadata, doUpload]
  );

  const TextInput = ({ label, name }: { label: string; name: string }) => {
    if (name.endsWith("date")) {
      return (
        <>
          <FormControl id={name}>
            <FormLabel>{label}</FormLabel>
            <Input
              type="date"
              value={metadata[name]}
              name={name}
              onChange={changeState}
            />
          </FormControl>
        </>
      );
    }
    return (
      <>
        <FormControl id={name}>
          <FormLabel>{label}</FormLabel>
          <Input
            type="text"
            value={metadata[name]}
            name={name}
            onChange={changeState}
          />
        </FormControl>
      </>
    );
  };

  return isPending ? (
    <Loading />
  ) : (
    <VStack>
      <Text>Uplaod single sequence file.</Text>
      <TextInput label="Isolate ID" name="isolate_id" />
      <TextInput label="Sequence ID" name="sequence_id" />
      <TextInput label="sequence_filename" name="sequence_filename" />
      <TextInput label="Institution" name="institution" />
      <TextInput label="Project Number" name="project_number" />
      <TextInput label="Project Title" name="project_title" />
      <TextInput label="Sampling Date" name="sampling_date" />
      <TextInput label="Received Date" name="received_date" />
      <TextInput label="Run id" name="run_id" />
      <TextInput label="Public" name="_public" />
      <TextInput label="Provided species" name="provided_species" />
      <TextInput label="Primary isolate?" name="primary_isolate" />
      <Input
        type="file"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setSelectedFile(e.target.files![0])
        }
      />
      <Button type="submit" onClick={submitForm}>
        Upload
      </Button>
    </VStack>
  );
}
