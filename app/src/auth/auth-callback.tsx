import React, { useEffect, useState } from "react";
import {
  TokenRequest,
  BaseTokenRequestHandler,
  GRANT_TYPE_AUTHORIZATION_CODE,
  AuthorizationServiceConfiguration,
  RedirectRequestHandler,
  AuthorizationNotifier,
  FetchRequestor,
} from "@openid/appauth";
import { Environment, setAccessToken, setRefreshToken } from "auth/environment";
import { useToast } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { Loading } from "loading";
import { requestUserInfo } from "app/user/user-query-configs";
import { useRequest } from "redux-query-react";

export const Callback = (props: {
  location: {
    search: string | string[][] | Record<string, string> | URLSearchParams;
  };
}) => {
  const toast = useToast();
  const { t } = useTranslation();

  const [authError, setAuthError] = useState(null);

  const callbackHandler = async () => {
    const tokenHandler = new BaseTokenRequestHandler(new FetchRequestor());
    const authorizationHandler = new RedirectRequestHandler(
      Environment.storageBackend,
      Environment.queryStringUtils,
      window.location,
      Environment.crypto
    );
    const notifier = new AuthorizationNotifier();
    authorizationHandler.setAuthorizationNotifier(notifier);
    notifier.setAuthorizationListener(async (request, response, error) => {
      try {
        if (response) {
          let extras = null;
          if (request && request.internal) {
            extras = {};
            extras.code_verifier = request.internal.code_verifier;
          }

          const tokenRequest = new TokenRequest({
            client_id: Environment.clientId,
            redirect_uri: Environment.redirectUri,
            grant_type: GRANT_TYPE_AUTHORIZATION_CODE,
            code: response.code,
            refresh_token: undefined,
            extras,
          });

          const config = await AuthorizationServiceConfiguration.fetchFromIssuer(
            Environment.openIdConnectUrl,
            new FetchRequestor()
          );
          const tokenResp = await tokenHandler.performTokenRequest(
            config,
            tokenRequest
          );
          setAccessToken(tokenResp.idToken);
          setRefreshToken(tokenResp.refreshToken);
          
          const profile = await fetch(
            `${Environment.openIdConnectUrl}${Environment.userInfoEndpoint}`,
            {
              headers: {
                authorization: `Bearer ${tokenResp.accessToken}`,
              },
            }
          );
          window.location.replace("/");
        } else {
          setAuthError(error);
        }
      } catch (err) {
        setAuthError(err);
      }
    });

    const params = new URLSearchParams(props.location.search);
    const code = params.get("code"); 

    if (!code) {
      setAuthError("Unable to get authorization code");
      return;
    }

    authorizationHandler.completeAuthorizationRequestIfPossible();

    if (authError) {
      console.error(authError);
      toast({
        title: t("Sign-in failed"),
        description: `${t("Error message:")} ${authError}`,
        status: "error",
        duration: null,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    callbackHandler();
  });

  if (!authError) {
    return <Loading />;
  }

  return <div />;
};
