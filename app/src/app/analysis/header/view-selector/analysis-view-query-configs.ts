import {
  getUserViews,
  UserDefinedView,
  createUserView,
} from "sap-client";
import { getUrl } from "service";

type UserDefinedViews = {
  userViews: UserDefinedView[];
};

export const requestUserViews = () => {
  const base = getUserViews<UserDefinedViews>();
  base.url = getUrl(base.url);
  base.transform = (response: UserDefinedView[]) => ({
    userViews: response,
  });
  base.update = {
    userViews: (_, newValue) => newValue
  };
  return base;
};

export const addUserView = (view: UserDefinedView) => {
  const base = createUserView<UserDefinedViews>({ userDefinedView: view });
  base.body = ({ view });
  base.update = {
    userViews: (_, newValue) => newValue
  }
  return base;
}