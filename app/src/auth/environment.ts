import { DefaultCrypto, LocalStorageBackend } from "@openid/appauth";
import { NoHashQueryStringUtils } from "./no-hash-query-string-utils";

export const Environment = {
  openIdConnectUrl: `${window.location.protocol}//${window.location.host}/.hydra`,
  clientId: "SOFI_APP",
  redirectUri: `${window.location.protocol}//${window.location.host}/callback`,
  scope: "openid offline offline_access email profile",
  userInfoEndpoint: "/userinfo",
  storageBackend: new LocalStorageBackend(),
  crypto: new DefaultCrypto(),
  queryStringUtils: new NoHashQueryStringUtils()
};

const AccessTokenKey = "id_token";
const RefreshTokenKey = "id_token";

export const getAccessToken = () => {
  return localStorage.getItem(AccessTokenKey);
}

export const getRefreshToken = () => {
  return localStorage.getItem(RefreshTokenKey);
}

export const setAccessToken = (token: string) => {
  localStorage.setItem(AccessTokenKey, token);
}

export const setRefreshToken = (token: string) => {
  localStorage.setItem(RefreshTokenKey, token);
}
