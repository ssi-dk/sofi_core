/** @jsxRuntime classic */
/** @jsxFrag React.Fragment */
/** @jsx jsx */
import React, { ChangeEvent, useState } from "react";
import {
  Input,
  Button,
  Select,
  Textarea,
  VStack,
  Spacer,
  Flex,
  Box,
} from "@chakra-ui/react"
import { jsx } from "@emotion/react"
import { rightPane, inputForm } from "app/gdpr/gdpr-extract/gdpr-extract-styles"
import { ExtractDataFromPiRequest, PersonalIdentifierType } from "sap-client";
import { requestAsync } from "redux-query";
import { useRequest } from "redux-query-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "app/root-reducer";
import { extractPersonalData } from "./gdpr-extracts-configs"
import Header from "../../header/header";


interface PersonalDataState {
  type?: PersonalIdentifierType;
  value: string;
}

const formstateToRequest = (state: PersonalDataState) => {
  if (state.type && state.value && state.value.length > 0) {
    const trimmed = state.value.trim();
    return {
      identifierType: state.type,
      identifier: state.value
    } as ExtractDataFromPiRequest
  }

  return null;
}


const GdprExtractPage = () => {
  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState({ type: null, value: "" } as PersonalDataState);

  const dispatch = useDispatch();

  const data = useSelector<RootState>((s) =>
    Object.values(s.entities.personDataFromExtract ?? "")
  ) as string;

  const typeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFormState({ ...formState, type: e.target.value as PersonalIdentifierType });
  }

  const idChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormState({ ...formState, value: e.target.value });
  }

  const fetchClick = React.useCallback((e) => {
    const req = formstateToRequest(formState)
    if (req) {
      //setLoading(true);
      dispatch(
        requestAsync(extractPersonalData(req))
      );
    }
  }, [formState, dispatch])

  const donwloadFile = React.useCallback((e) => {
    const element = document.createElement("a");
    // Something is funky with the typing here, so we have to do this casting..
    const file = new Blob([((data as any) as Array<string>).join("")], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = "personal_data_extract.txt";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  }, [data])

  const preElementWithDownload = () => {
    if (data.length === 0) {
      return <React.Fragment />
    }

    return <div css={rightPane}><Button type="button" mb="2" onClick={donwloadFile}>Download output</Button> <pre>{data}</pre></div>
  }

  return (
    <Box
      display="grid"
      gridTemplateRows="10% auto"
      gridTemplateColumns="25% auto"
      padding="8"
      height="100vh"
      gridGap="5"
    >
      <Box role="heading" gridColumn="1 / 3">
        <Header sidebarWidth="300px" />
      </Box>
      <Box gridColumn="1 / 2">
        <VStack css={inputForm}>
          <Select placeholder="Identifier type" onChange={typeChange}>
            <option value={PersonalIdentifierType.CPR}>CPR</option>
            <option value={PersonalIdentifierType.CVR}>CVR</option>
            <option value={PersonalIdentifierType.CHR}>CHR</option>
          </Select>
          <Input placeholder="Identifier" onChange={idChange} />
          <Button colorScheme="blue" onClick={fetchClick}>Fetch</Button>
        </VStack>
      </Box>
      <Box gridColumn="2 / 2" overflowY="scroll">
        <VStack>
          {loading
            ? <div>Loading data...</div>
            : preElementWithDownload()}
        </VStack>
      </Box>
    </Box>
  );
};
export default GdprExtractPage;