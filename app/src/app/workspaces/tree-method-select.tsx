import React, { useCallback, useMemo, useState } from "react";
import Select, { OptionTypeBase } from "react-select";

type Props = {
  onChange: (id: string) => void;
};

export const TreeMethodSelect = (props: Props) => {
  const { onChange } = props;

  const [treeMethod, setTreeMethod] = useState<OptionTypeBase>();

  const treeMethods = useMemo(() => {
    return [
      "single",
      "complete",
      "average",
      "weighted",
      "centroid",
      "median",
      "ward"
    ].map((v) => {
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
