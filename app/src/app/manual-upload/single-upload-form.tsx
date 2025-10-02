import React, { useState } from "react";
import {
  VStack,
  Input,
  Button,
  Text,
  FormLabel,
  FormControl,
  useToast,
} from "@chakra-ui/react";
import { SingleUploadRequest } from "sap-client/apis/UploadApi";
import { Loading } from "loading";
import { useMutation } from "redux-query-react";
import { useTranslation } from "react-i18next";
import { uploadIsolateFile } from "./manual-upload-configs";
import TextInput from "./text-input";
import Species from "../data/species.json";
import CreatableSelect from "react-select/creatable";
import { UploadMetadataFields } from "sap-client";

const initialState = {
  sample_id: "",
  sofi_sequence_id: "",
  project_no: "2",
  provided_species: "",
  project_title: "Urgent Inquiries",
  sequence_run_date: new Date(),
  group: "",
  experiment_name: "",
} as UploadMetadataFields;

function SingleUploadForm() {
  const [formDisabled, setFormDisabled] = useState(true);
  const { t } = useTranslation();
  const toast = useToast();

  const speciesNames = React.useMemo(() => Species.map((x) => x["name"]), []);

  const speciesOptions = React.useMemo(
    () => speciesNames.map((x) => ({ label: x, value: x })),
    [speciesNames]
  );

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
      const meta = { ...metadata, [name]: value };
      setMetadata(meta);
    },
    [setMetadata, metadata]
  );

  const changeOptionState = React.useCallback(
    (newValue: any) => {
      const meta = { ...metadata, provided_species: newValue.value };
      setMetadata(meta);
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
        metadata: metadata as any,
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
          name="sample_id"
          value={metadata.sample_id}
          onChange={changeState}
        />
        <TextInput
          isRequired
          label="Sequence ID"
          name="sofi_sequence_id"
          value={metadata.sofi_sequence_id}
          onChange={changeState}
        />
        <TextInput
          isRequired
          label="Experiment Name"
          name="experiment_name"
          value={metadata.experiment_name}
          onChange={changeState}
        />
        <div style={{ width: "100%" }}>
          Provided Species
          <CreatableSelect
            isClearable={false}
            defaultValue={{ label: "", value: "" }}
            options={speciesOptions}
            onChange={changeOptionState}
            menuPortalTarget={document.body}
            menuShouldScrollIntoView={false}
          />
        </div>
        <TextInput
          isRequired
          label="Project Number"
          name="project_no"
          value={metadata.project_no}
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
          label="Group"
          name="group"
          value={metadata.group}
          onChange={changeState}
        />
        <TextInput
          label="Sampling Date"
          name="sequence_run_date"
          value={metadata.sequence_run_date}
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
