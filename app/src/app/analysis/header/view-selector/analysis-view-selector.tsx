import React from "react";
import Select from "react-select";
import { RootState } from 'app/root-reducer';
import { selectTheme } from "app/app.styles";
import { UserDefinedView, UserDefinedViewTableState } from "sap-client";
import { useRequest } from 'redux-query-react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { requestAsync } from 'redux-query';
import { requestUserViews, addUserView } from './analysis-view-query-configs';
import { defaultViews, setView } from './analysis-view-selection-config';
import { spyDataTable } from "../../data-table/table-spy";

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
  
  const viewSelectUpdate = (event) => {
    const { value } = event;
    if (value === addViewValue) {
      const viewName = prompt("View name");
      if (viewName) {
        const tableState = spyDataTable()
        const newView = { name: viewName, tableState: tableState as UserDefinedViewTableState };
        dispatch(requestAsync(addUserView(newView)));
        dispatch(setView(newView));
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
