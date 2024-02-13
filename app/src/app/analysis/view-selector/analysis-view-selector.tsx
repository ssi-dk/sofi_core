import React from "react";
import Select from "react-select";
import { RootState } from "app/root-reducer";
import { selectTheme } from "app/app.styles";
import { UserDefinedViewInternal } from "models";
import { useMutation, useRequest } from "redux-query-react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  requestUserViews,
  addUserViewMutation,
  deleteUserViewMutation,
} from "./analysis-view-query-configs";
import { defaultViews, setView } from "./analysis-view-selection-config";
import { spyDataTable } from "../data-table/table-spy";

const AnalysisViewSelector = () => {
  const { t } = useTranslation();
  const addViewValue = "AddView";
  const deleteViewValue = "DeleteView";

  const buildOptions = React.useCallback(
    (options: UserDefinedViewInternal[]) => [
      { label: `-- ${t("Save current view")}`, value: addViewValue },
      { label: `-- ${t("Delete current view")}`, value: deleteViewValue },
      {
        label: t("Predefined views"),
        options: defaultViews.map((x) => ({ label: x.name, value: x })),
      },
      {
        label: t("My views"),
        options: options.map((x) => ({ label: x.name, value: x })),
      },
    ],
    [t]
  );

  const dispatch = useDispatch();
  const userViews = useSelector<RootState>(
    (s) => {
      return Object.values(s.entities?.userViews ?? {});
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (a: any, b: any) => a.entities?.userViews === b.entities?.userViews // prevents unnecessary re-renders
  ) as UserDefinedViewInternal[];
  const view = useSelector<RootState>(
    (s) => s.view.view
  ) as UserDefinedViewInternal;

  const viewReq = React.useMemo(
    () => ({
      ...requestUserViews(),
    }),
    []
  );
  const [{ isPending, isFinished }] = useRequest(viewReq);
  const [queryState, addView] = useMutation((v: UserDefinedViewInternal) =>
    addUserViewMutation(v)
  );
  const deleteView = useMutation((v: UserDefinedViewInternal) =>
    deleteUserViewMutation(v)
  )[1];

  const viewSelectUpdate = React.useCallback(
    async (event) => {
      const { value } = event;
      if (value === addViewValue) {
        var viewName = prompt("View name");
        if (viewName) {
          const nameAlreadyExists = userViews.some(
            (view) => view.name === viewName
          );
          if (nameAlreadyExists) {
            const pattern = `${viewName}_`;
            const matchingViews = userViews.filter((view) =>
              view.name.startsWith(pattern)
            );

            const numbers = matchingViews
              .map((view) => {
                const numberPart = view.name.slice(pattern.length);
                return parseInt(numberPart, 10);
              })
              .filter((number) => !isNaN(number));

            const nextNumber = Math.max(...numbers, 0) + 1;
            viewName += `_${nextNumber}`;
          }

          const tableState = spyDataTable();
          const newView = { ...tableState, name: viewName };
          await addView(newView);
          dispatch(setView(newView));
        }
      } else if (value === deleteViewValue) {
        // eslint-disable-next-line
        const doIt = confirm(
          t("Are you sure you want to delete the currently selected view?")
        );
        if (doIt) {
          deleteView(view);
          dispatch(setView(defaultViews[0]));
        }
      } else {
        dispatch(setView(value));
      }
    },
    [dispatch, addView, deleteView, t, view, userViews]
  );

  const value = React.useMemo(() => ({ label: view.name, value: view }), [
    view,
  ]);

  return (
    <Select
      options={isFinished ? buildOptions(userViews) : ([] as any[])}
      defaultValue={value}
      value={value}
      theme={selectTheme}
      isLoading={isPending || queryState.isPending}
      onChange={viewSelectUpdate}
    />
  );
};

export default AnalysisViewSelector;
