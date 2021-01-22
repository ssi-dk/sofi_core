import React from "react";
import {
  AuthorizationRequest,
  AuthorizationServiceConfiguration,
  FetchRequestor,
  RedirectRequestHandler,
} from "@openid/appauth";
import { useToast } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { Loading } from "loading";
import { Environment } from "./environment";

export const Authorize = (props) => {

  const toast = useToast();
  const { t } = useTranslation();

  const authorizationHandler = new RedirectRequestHandler(
    Environment.storageBackend,
    Environment.queryStringUtils,
    window.location,
    Environment.crypto
  );
  const redirect = () => {
    AuthorizationServiceConfiguration.fetchFromIssuer(
      Environment.openIdConnectUrl,
      new FetchRequestor()
    )
      .then((response) => {
        const authRequest = new AuthorizationRequest({
          client_id: Environment.clientId,
          redirect_uri: Environment.redirectUri,
          scope: Environment.scope,
          response_type: AuthorizationRequest.RESPONSE_TYPE_CODE,
          state: undefined,
          // extras: environment.extra
        });
        authorizationHandler.performAuthorizationRequest(response, authRequest);
      })
      .catch((error) => {
        toast({
          title: t("Sign-in failed"),
          description: `${t("Error message:")} ${error}`,
          status: "error",
          duration: null,
          isClosable: true,
        });
      });
  };

  const isLoggedIn = () => {
    return window.localStorage.getItem("id_token");
  };

  if (isLoggedIn()) {
    return <React.Fragment>{props.children}</React.Fragment>;
  }

  redirect();
  return <Loading/>; 
};
