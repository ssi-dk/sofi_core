import { RootState } from "app/root-reducer";
import React, { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import Select, { OptionTypeBase } from "react-select";
import { useRequest } from "redux-query-react";
import { Workspace } from "sap-client/models";
import { fetchWorkspaces } from "./workspaces-query-configs";
import { useTranslation } from "react-i18next";

type Props = {
  onChange: (id: string) => void;
};

export const WorkspaceSelect = (props: Props) => {
  const { onChange } = props;
  const [workspacesQueryState] = useRequest(fetchWorkspaces());
  const { t } = useTranslation();

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

  const options = useMemo(() => {
    const newOptions = new Array<
      | { label: string; value: string }
      | {
          label: string;
          options: Array<{
            label: string;
            value: string;
          }>;
        }
    >({
      label: `-- ${t("New workspace")}`,
      value: "-- New workspace",
    });

    const workspaceOptions = workspaces.map((w) => {
      return {
        value: w.id,
        label: w.name,
      };
    });
    newOptions.push({
      label: t("Existing workspaces"),
      options: workspaceOptions,
    });

    return newOptions;
  }, [workspaces, t]);

  return (
    <Select
      options={options}
      defaultValue={workspace}
      value={workspace}
      isLoading={workspacesQueryState.isPending}
      onChange={onChangeCallback}
    />
  );
};
