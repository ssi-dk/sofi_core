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
  useToast,
} from "@chakra-ui/react";
import { jsx } from "@emotion/react";
import { ExtractDataFromPiRequest, ForgetPiiRequest, PersonalIdentifierType } from "sap-client";
import { requestAsync } from "redux-query";
import { RootState } from "app/root-reducer";
import { useMutation } from "redux-query-react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { forgetPersonalData, ForgetPiiResponse } from "./gdpr-forget-configs";
import { inputForm } from "./gdpr-forget-styles";
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
      identifier: state.value,
    } as ExtractDataFromPiRequest;
  }

  return null;
};

const getForgetResponse = (state: {
  entities: ForgetPiiResponse ;
}) => state.entities.forgetPiiResponse;

const GdprForgetPage = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [needsNotify, setNeedsNotify] = useState(true);
  const [formState, setFormState] = useState({
    type: null,
    value: "",
  } as PersonalDataState);

  const [{ isPending, status }, removeUserData] = useMutation(
    (fs: PersonalDataState) => {
      const req = formstateToRequest(fs);
      return forgetPersonalData(req);
    }
  );

  const forgetResponse = useSelector(getForgetResponse);

  const deleteClick = React.useCallback(() => {
    setNeedsNotify(true);
    removeUserData(formState);
  }, [removeUserData, formState]);

  // reload success status toast
  React.useMemo(() => {
    if (needsNotify && status >= 200 && status < 300 && !isPending) {
      const description = forgetResponse === "" ? t("Person does not exist in the system") : `${t("Removed personal data by")} ${formState.type}.`;
      toast({
        title: t("Request successful"),
        description,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setNeedsNotify(false);
    }
  }, [t, toast, needsNotify, isPending, formState, status, forgetResponse]);

  // reload failure status toast
  React.useMemo(() => {
    if (needsNotify && status >= 300 && !isPending) {
      toast({
        title: t("Unknown error"),
        description: `${t("Error while trying to remove personal data")}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setNeedsNotify(false);
    }
  }, [t, toast, needsNotify, isPending, status]);
  const dispatch = useDispatch();

  const typeChange = React.useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setFormState({
        ...formState,
        type: e.target.value as PersonalIdentifierType,
      });
    },
    [formState, setFormState]
  );

  const idChange = React.useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setFormState({ ...formState, value: e.target.value });
    },
    [formState, setFormState]
  );

  return (
    <div>
      <VStack css={inputForm}>
        <Select onChange={typeChange}>
          <option value="" disabled selected>
            {t("Identifier type")}
          </option>
          <option value={PersonalIdentifierType.CPR}>CPR</option>
          <option value={PersonalIdentifierType.CVR}>CVR</option>
          <option value={PersonalIdentifierType.CHR}>CHR</option>
        </Select>
        <Input placeholder="Identifier" onChange={idChange} />
        <Button isLoading={isPending} colorScheme="blue" onClick={deleteClick}>
          {t("Forget user")}
        </Button>
      </VStack>
    </div>
  );
};
export default GdprForgetPage;
