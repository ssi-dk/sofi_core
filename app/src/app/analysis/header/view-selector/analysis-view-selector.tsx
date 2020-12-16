import React from "react";
import Select from "react-select";
import { RootState } from 'app/root-reducer';
import { selectTheme } from "app/app.styles";
import { UserDefinedView } from "sap-client";
import { useMutation, useRequest } from "redux-query-react";
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { requestUserViews, addUserViewMutation } from "./analysis-view-query-configs";
import { defaultViews, setView } from './analysis-view-selection-config';
import { spyDataTable } from "../../data-table/table-spy";
import { mapTableStateToView } from "./table-state-view-mapper";

const AnalysisViewSelector = () => {
  const { t } = useTranslation();
  const addViewValue = "AddView";

  const buildOptions = React.useCallback((options: UserDefinedView[]) => [
    { label: t("Save current view"), value: addViewValue },
    { label: t("Predefined views"), options: defaultViews.map(x => ({ label: x.name, value: x })) },
    { label: t("My views"), options: options.map(x => ({ label: x.name, value: x })) },
  ], [t]);

  const dispatch = useDispatch();
  const userViews = useSelector<RootState>(
    (s) => {
      return Object.values(s.entities?.userViews ?? {});
    },
    (a: any, b: any) => a.entities?.userViews === b.entities?.userViews // prevents unnecessary re-renders
  ) as UserDefinedView[];
  const view = useSelector<RootState>((s) => s.view.view) as UserDefinedView;
  const viewReq = React.useMemo(
    () => ({
      ...requestUserViews(),
    }), []
  );
  const [{ isPending, isFinished }] = useRequest(viewReq);
  const [queryState, addView] = useMutation((v: UserDefinedView) => addUserViewMutation(v));

  const viewSelectUpdate = React.useCallback((event) => {
    const { value } = event;
    if (value === addViewValue) {
      const viewName = prompt("View name");
      if (viewName) {
        const tableState = spyDataTable()
        const newView = mapTableStateToView(viewName, tableState);
        addView(newView).then(() => dispatch(setView(newView)));
      }
    } else {
      dispatch(setView(value))
    }
  }, [dispatch, addView]);

  const defaultValue= React.useMemo(() => ({label: view.name, value: view}), [view]);

  return <Select 
    options={isFinished ? buildOptions(userViews) : [] as any[]}
    defaultValue={defaultValue}
    theme={selectTheme} 
    isLoading={isPending || queryState.isPending}
    onChange={viewSelectUpdate}
  />;
}

export default React.memo(AnalysisViewSelector);
