import { UserInfo, whoAmI } from "sap-client";
import { getUrl } from "service";

export type UserSlice = {
  user: UserInfo;
};

// query config for retrieving user info
export const requestUserInfo = () => {
  // use generated api client as base
  const base = whoAmI<UserSlice>();
  // template the full path for the url
  base.url = getUrl(base.url);
  // define the update strategy for our state
  base.update = {
      user: (_, newValue) => newValue
  };
  return base;
};
