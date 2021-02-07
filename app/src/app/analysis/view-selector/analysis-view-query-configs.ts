import {
  getUserViews,
  UserDefinedView,
  createUserView,
  deleteView,
} from "sap-client";
import snakeCaseKeys from "snakecase-keys";
import camelCaseKeys from "camelcase-keys";
import { UserDefinedViewInternal } from "models";
import { getUrl } from "service";

type UserDefinedViews = {
  userViews: UserDefinedView[];
};

// Make sure required keys are defined, just in case
const makeWhole = (view: UserDefinedView) => {
  const v = { ...view };
  if (!v.column_order) {
    v.column_order = [];
  }
  if (!v.column_resizing) {
    v.column_resizing = {};
  }
  if (!v.column_resizing.column_widths) {
    v.column_resizing.column_widths = {};
  }
  if (!v.sort_by) {
    v.sort_by = [];
  }
  return v;
};

// The SDK has the keys for these properties in snake_case, but we deal with it
// internally as camelCase, because that's what react-table expects.
// Here at the network boundary, we handle the conversion
const transformIn = (view: UserDefinedView) => {
  makeWhole(view);
  const camelCased = camelCaseKeys(JSON.parse(JSON.stringify(view)), { deep: true }) as UserDefinedViewInternal;
  // column names need to remain snake_cased
  if (camelCased?.columnResizing?.columnWidths) {
    camelCased.columnResizing.columnWidths = view?.column_resizing?.column_widths;
  }
  return camelCased;
};

const transformOut = (view: UserDefinedViewInternal) => {
  const v = snakeCaseKeys(view);
  return makeWhole(v) as UserDefinedView;
};

export const requestUserViews = () => {
  const base = getUserViews<UserDefinedViews>();
  base.url = getUrl(base.url);
  base.transform = (response: UserDefinedView[]) => {
    return {
      userViews: response.map((x) => transformIn(x)),
    };
  };
  base.update = {
    userViews: (_, newValue) => newValue,
  };
  return base;
};

export const addUserViewMutation = (view: UserDefinedViewInternal) => {
  const convertedView = transformOut(view);
  const base = createUserView<UserDefinedViews>({
    userDefinedView: convertedView,
  });
  base.url = getUrl(base.url);
  base.transform = (response) => transformIn(response) as any;
  base.update = {
    userViews: (oldViews) => [...oldViews, view],
  };
  return base;
};

export const deleteUserViewMutation = (view: UserDefinedView) => {
  const base = deleteView<UserDefinedViews>({ name: view.name });
  base.url = getUrl(base.url);
  base.update = {
    userViews: (oldViews) => oldViews.filter((x) => x.name !== view.name),
  };
  return base;
};
