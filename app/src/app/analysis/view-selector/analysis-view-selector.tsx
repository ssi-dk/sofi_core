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

type Props = {
  manageViews?: boolean;
};

export const AnalysisViewSelector = (props: Props) => {
  const { manageViews } = props;
  const { t } = useTranslation();
  const addViewValue = "AddView";
  const deleteViewValue = "DeleteView";

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
        let viewName = prompt("View name");
        if (viewName) {
          const nameAlreadyExists = userViews.some(
            (newView) => newView.name === viewName
          );
          if (nameAlreadyExists) {
            const pattern = `${viewName}_`;
            const matchingViews = userViews.filter((newView) =>
              newView.name.startsWith(pattern)
            );

            const numbers = matchingViews
              .map((newView) => {
                const numberPart = newView.name.slice(pattern.length);
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

  const selectOptions = React.useMemo(() => {
    let options = new Array<
      | { label: string; value: string | UserDefinedViewInternal }
      | {
          label: string;
          options: Array<{
            label: string;
            value: string | UserDefinedViewInternal;
          }>;
        }
    >();

    if (manageViews !== false) {
      options = options.concat([
        { label: `-- ${t("Save current view")}`, value: addViewValue },
        { label: `-- ${t("Delete current view")}`, value: deleteViewValue },
      ]);
    }

    options.push({
      label: t("Predefined views"),
      options: defaultViews.map((x) => ({ label: x.name, value: x })),
    });

    if (isFinished) {
      options.push({
        label: t("My views"),
        options: userViews.map((x) => ({ label: x.name, value: x })),
      });
    }

    return options;
  }, [t, isFinished, userViews, manageViews]);

  return (
    <Select
      options={selectOptions}
      defaultValue={value}
      value={value}
      theme={selectTheme}
      isLoading={isPending || queryState.isPending}
      onChange={viewSelectUpdate}
    />
  );
};
