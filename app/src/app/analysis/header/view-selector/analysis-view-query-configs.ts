import {
  getUserViews,
  UserDefinedView,
  createUserView,
  deleteView,
  UserDefinedViewFromJSON,
} from "sap-client";
import { getUrl } from "service";

type UserDefinedViews = {
  userViews: UserDefinedView[];
};

export const requestUserViews = () => {
  const base = getUserViews<UserDefinedViews>();
  base.url = getUrl(base.url);
  base.transform = (response: UserDefinedView[]) => {
    return {
      userViews: response.map((x) => UserDefinedViewFromJSON(x)),
    };
  };
  base.update = {
    userViews: (_, newValue) => newValue
  }
  return base;
};

export const addUserViewMutation = (view: UserDefinedView) => {
  const base = createUserView<UserDefinedViews>({ userDefinedView: view });
  base.url = getUrl(base.url);
  base.update = {
    userViews: (oldViews) => [...oldViews, view]
  }
  return base;
}

export const deleteUserViewMutation = (view: UserDefinedView) => {
  const base = deleteView<UserDefinedViews>({name: view.name});
  base.url = getUrl(base.url);
  base.update = {
    userViews: (oldViews) => oldViews.filter(x => x.name !== view.name)
  }
  return base;
}
