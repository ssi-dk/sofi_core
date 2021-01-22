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
