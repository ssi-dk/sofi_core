import { Checkbox, CheckboxGroup, Stack } from "@chakra-ui/react";
import React, { useCallback, useMemo } from "react";
import { TreeMethod } from "sap-client";
import { StringOrNumber } from "utils";

type Props = {
  onChange: (id: Array<string>) => void;
  value: Array<string>;
};

export const TreeMethodCheckboxGroup = (props: Props) => {
  const { onChange, value } = props;

  const treeMethods = useMemo(() => {
    const methods = new Array<string>();
    for (const tm in TreeMethod) {
      methods.push(tm);
    }
    return methods;
  }, []);

  const onChangeCallback = useCallback(
    (checkboxValue: StringOrNumber[]) => {
      onChange(checkboxValue.map((v) => String(v)));
    },
    [onChange]
  );

  return (
    <CheckboxGroup defaultValue={value} onChange={onChangeCallback}>
      <Stack spacing={2}>
        {treeMethods?.map((treeMethod) => {
          return <Checkbox value={treeMethod}>{treeMethod}</Checkbox>;
        })}
      </Stack>
    </CheckboxGroup>
  );
};
