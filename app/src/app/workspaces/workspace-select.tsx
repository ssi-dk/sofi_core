import { RootState } from "app/root-reducer";
import React, { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import Select, { OptionTypeBase } from "react-select";
import { useRequest } from "redux-query-react";
import { Workspace } from "sap-client/models";
import { fetchWorkspaces } from "./workspaces-query-configs";

type Props = {
  onChange: (id: string) => void;
};

export const WorkspaceSelect = (props: Props) => {
  const { onChange } = props;
  const [workspacesQueryState] = useRequest(fetchWorkspaces());

  const workspaces = useSelector<RootState>((s) =>
    Object.values(s.entities.workspaces ?? {})
  ) as Array<Workspace>;

  const [workspace, setWorkspace] = useState<OptionTypeBase>();

  const onChangeCallback = useCallback(
    (option: OptionTypeBase) => {
      setWorkspace(option);
      onChange(option.value);
    },
    [setWorkspace, onChange]
  );

  return (
    <Select
      options={workspaces.map((w) => {
        return {
          value: w.id,
          label: w.name,
        };
      })}
      defaultValue={workspace}
      value={workspace}
      isLoading={workspacesQueryState.isPending}
      onChange={onChangeCallback}
    />
  );
};
