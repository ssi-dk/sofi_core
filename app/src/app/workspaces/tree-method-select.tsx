import React, { useCallback, useMemo, useState } from "react";
import Select, { OptionTypeBase } from "react-select";
import { TreeMethod } from "sap-client";

type Props = {
  onChange: (id: string) => void;
  value: string;
};

export const TreeMethodSelect = (props: Props) => {
  const { onChange, value } = props;

  const [treeMethod, setTreeMethod] = useState<OptionTypeBase>({
    value,
    label: value,
  });

  const treeMethods = useMemo(() => {
    const methods = new Array<string>();
    for (const tm in TreeMethod) {
      methods.push(tm);
    }
    return methods.map((v) => {
      return {
        value: v,
        label: v,
      };
    });
  }, []);

  const onChangeCallback = useCallback(
    (option: OptionTypeBase) => {
      setTreeMethod(option);
      onChange(option.value);
    },
    [setTreeMethod, onChange]
  );

  return (
    <Select
      options={treeMethods}
      defaultValue={treeMethod}
      value={treeMethod}
      onChange={onChangeCallback}
    />
  );
};
