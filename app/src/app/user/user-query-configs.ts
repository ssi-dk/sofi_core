import { UserInfo, whoAmI } from "sap-client";
import { getUrl } from "service";

export type UserSlice = {
  user: UserInfo;
};

// query config for retrieving user info
export const requestUserInfo = () => {
  const base = whoAmI<UserSlice>();

  base.url = getUrl(base.url);

  base.transform = (response: UserInfo) => ({ user: response });

  base.update = {
    user: (_, newValue) => newValue,
  };
  return base;
};
