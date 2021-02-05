import { DefaultCrypto, LocalStorageBackend } from "@openid/appauth";
import { NoHashQueryStringUtils } from "./no-hash-query-string-utils";

export const Environment = {
  openIdConnectUrl: `${window.location.protocol}//${window.location.host}`,
  clientId: "SOFI_APP",
  redirectUri: `${window.location.protocol}//${window.location.host}/callback`,
  signoutUrl: `${window.location.protocol}//${window.location.host}/.ory/kratos/public/self-service/browser/flows/logout`,
  scope: "openid offline email profile",
  userInfoEndpoint: "/.well-known/userinfo",
  storageBackend: new LocalStorageBackend(),
  crypto: new DefaultCrypto(),
  queryStringUtils: new NoHashQueryStringUtils(),
};

const AccessTokenKey = "id_token";
const RefreshTokenKey = "refresh_token";

export const getAccessToken = () => {
  return localStorage.getItem(AccessTokenKey);
};

export const getRefreshToken = () => {
  return localStorage.getItem(RefreshTokenKey);
};

export const setAccessToken = (token: string) => {
  localStorage.setItem(AccessTokenKey, token);
};

export const setRefreshToken = (token: string) => {
  localStorage.setItem(RefreshTokenKey, token);
};

export const clearAccessToken = (token: string) => {
  localStorage.removeItem(AccessTokenKey);
};

export const clearRefreshToken = (token: string) => {
  localStorage.removeItem(RefreshTokenKey);
};

export const logout = () => {
  clearAccessToken(undefined);
  clearRefreshToken(undefined);
  window.location.replace(
    `${Environment.signoutUrl}?return_to=${window.location.protocol}//${window.location.host}`
  );
};
