import { DefaultCrypto, LocalStorageBackend } from "@openid/appauth";
import { NoHashQueryStringUtils } from "./no-hash-query-string-utils";

export const Environment = {
  openIdConnectUrl: `${window.location.protocol}//${window.location.host}/auth/realms/sofi`,
  clientId: "SOFI_APP",
  redirectUri: `${window.location.protocol}//${window.location.host}/callback`,
  signoutUrl: `${window.location.protocol}//${window.location.host}/auth/realms/sofi/protocol/openid-connect/logout`,
  scope: "openid offline_access email profile",
  userInfoEndpoint: "/protocol/openid-connect/userinfo",
  storageBackend: new LocalStorageBackend(),
  crypto: new DefaultCrypto(),
  queryStringUtils: new NoHashQueryStringUtils(),
};

const AccessTokenKey = "id_token";
const RefreshTokenKey = "refresh_token";
const ProgressTokenKey = "is_logging_in";

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

export const clearAccessToken = () => {
  localStorage.removeItem(AccessTokenKey);
};

export const clearRefreshToken = () => {
  localStorage.removeItem(RefreshTokenKey);
};

export const setIsLoggingIn = () => {
  localStorage.setItem(ProgressTokenKey, "");
};

export const getIsLoggingIn = () => {
  return localStorage.getItem(ProgressTokenKey) === "";
};

export const clearIsLoggingIn = () => {
  localStorage.removeItem(ProgressTokenKey);
};

export const logout = () => {
  const access = getAccessToken();
  clearAccessToken();
  clearRefreshToken();
  window.location.replace(
    `${Environment.signoutUrl}?post_logout_redirect_uri=${encodeURIComponent(
      `${window.location.protocol}//${window.location.host}`
    )}&id_token_hint=${access}`
  );
};
