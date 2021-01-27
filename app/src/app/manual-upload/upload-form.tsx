import React, { useState } from "react";
import {
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
} from "@chakra-ui/react"
import axios from "axios";
import { BaseMetadata } from "sap-client/models/BaseMetadata"
import { Organization } from "sap-client/models/Organization";
import { isolateUpload } from "sap-client/apis/UploadApi";
import { getUrl } from "service";

const UploadForm = () => {
  const [selectedFile, setSelectedFile] = useState<any>(null);

  const [state, setState] = React.useState({
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
    primary_isolate: true
  } as BaseMetadata);

  const changeState = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;
    console.log(state);
    setState({
      ...state,
      [name]: value
    });
  };

  const submitForm = (e: any) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("metadata", JSON.stringify(state));
    formData.append("file", selectedFile);
    
    axios
      .post(getUrl("/isolateupload"), formData)
      .then((res) => {
        console.log(res);
        alert("File Upload success");
      })
      .catch((err) => alert("File Upload Error"));
  };

  const TextInput = ({ label, name }: { label: string; name: string }) => {
    if (name.endsWith("date")) {
      return (
        <>
          <FormControl id={name}>
            <FormLabel>{label}</FormLabel>
            <Input type="date" value={state[name]} name={name} onChange={changeState} />
          </FormControl>
        </>
      );
    }
    return (
      <>
        <FormControl id={name}>
          <FormLabel>{label}</FormLabel>
          <Input type="text" value={state[name]} name={name} onChange={changeState} />
        </FormControl>
      </>
    );
  };

  return (
    <form>
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
      <input
        type="file"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setSelectedFile(e.target.files![0])
        }
      />
      <button type="submit" onClick={submitForm}>Submit</button>
    </form>
  );
};

export default UploadForm;

