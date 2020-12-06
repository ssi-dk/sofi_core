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
    userViews: (_, newValue) =>
    // Fake some random views - obivously don't map once backend has views implemented.
    newValue.map(v => ({
      ...v,
      columns: [
        "isolate_id", "sequence_id", "institution", "project_number", "project_title", "sampling_date",
        "received_date", "run_id", "name", "cpr", "gender", "age"
      ].filter(() => Math.random() > 0.25)
    })),
  };
  return base;
};

export const addUserView = (view: UserDefinedView) => {
  const base = createUserView<UserDefinedViews>({ userDefinedView: view });
  base.body = ({ view });
  base.update = {
    userViews: (oldValue, newValue) => [
      ...oldValue,
      view
    ]
  }
  return base;
}