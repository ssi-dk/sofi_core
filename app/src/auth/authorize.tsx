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
import { requestUserInfo } from "app/user/user-query-configs";
import { useRequest } from "redux-query-react";
import {
  clearIsLoggingIn,
  Environment,
  getAccessToken,
  getIsLoggingIn,
  setIsLoggingIn,
} from "./environment";

export const Authorize = (props: { children: React.ReactNode }) => {
  const toast = useToast();
  const { t } = useTranslation();

  const authorizationHandler = new RedirectRequestHandler(
    Environment.storageBackend,
    Environment.queryStringUtils,
    window.location,
    Environment.crypto
  );
  const redirect = () => {
    setIsLoggingIn();
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
        clearIsLoggingIn();
      });
  };

  const isLoggedIn = () => {
    return getAccessToken();
  };

  const [{ isPending, isFinished }] = useRequest(requestUserInfo());
  if (isLoggedIn() && isFinished) {
    return <React.Fragment>{props.children}</React.Fragment>;
  }

  if (!isLoggedIn() && !getIsLoggingIn()) {
    redirect();
  }

  return <Loading />;
};
