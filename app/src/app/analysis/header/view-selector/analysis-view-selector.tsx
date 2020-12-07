import React from "react";
import Select from "react-select";
import { RootState } from 'app/root-reducer';
import { selectTheme } from "app/app.styles";
import { UserDefinedView } from "sap-client";
import { QueryConfigFactory, useMutation, useRequest } from "redux-query-react";
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { requestUserViews, addUserViewMutation } from "./analysis-view-query-configs";
import { defaultViews, setView } from './analysis-view-selection-config';
import { spyDataTable } from "../../data-table/table-spy";
import { mapTableStateToView } from "./table-state-view-mapper";

export default function AnalysisViewSelector() {
  const { t } = useTranslation();
  const addViewValue = "AddView";

  const buildOptions = (options: UserDefinedView[]) => [
    { label: t("Save current view"), value: addViewValue },
    { label: t("Predefined views"), options: defaultViews.map(x => ({ label: x.name, value: x })) },
    { label: t("My views"), options: options.map(x => ({ label: x.name, value: x })) },
  ];

  const dispatch = useDispatch();
  const userViews = useSelector<RootState>((s) => {
    return Object.values(s.entities.userViews ?? {})
  }) as UserDefinedView[];
  const view = useSelector<RootState>((s) => s.view.view) as UserDefinedView;
  const viewReq = React.useMemo(
    () => ({
      ...requestUserViews(),
    }), []
  );
  const [{ isPending, isFinished }] = useRequest(viewReq);
  const [queryState, addView] = useMutation(v => addUserViewMutation(v));

  const viewSelectUpdate = (event) => {
    const { value } = event;
    if (value === addViewValue) {
      const viewName = prompt("View name");
      if (viewName) {
        const tableState = spyDataTable()
        const newView = mapTableStateToView(viewName, tableState);
        // TODO: Probably don't cast to never?
        addView(newView as never).then(_ => dispatch(setView(newView)));
      }
    } else {
      dispatch(setView(value))
    }
  };

  return <Select 
    options={isFinished ? buildOptions(userViews) : []}
    defaultValue={({label: view.name, value: view})}
    theme={selectTheme} 
    isLoading={isPending} 
    onChange={viewSelectUpdate}
  />;
}
