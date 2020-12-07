import {
  getUserViews,
  UserDefinedView,
  createUserView,
} from "sap-client";
import { getUrl } from "service";
import { QueryConfig } from "redux-query";

type UserDefinedViews = {
  userViews: UserDefinedView[];
};

const setupBase = (base: QueryConfig<UserDefinedViews>) => {
  base.url = getUrl(base.url);
  base.transform = (response: UserDefinedView[]) => ({
    userViews: response,
  });
  base.update = {
    userViews: (_, newValue) => newValue
  }
  return base;
}

export const requestUserViews = () => {
  const base = getUserViews<UserDefinedViews>();
  return setupBase(base);
};

export const addUserViewMutation = (view: UserDefinedView) => {
  console.log(view);
  const base = createUserView<UserDefinedViews>({ userDefinedView: view });
  return setupBase(base);
}
