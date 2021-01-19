import { Spinner } from "@chakra-ui/react";
import React from "react";
import {
  ActionMeta,
  InputActionMeta,
  OptionTypeBase,
  Styles,
  ValueType,
} from "react-select";

import CreatableSelect from "react-select/creatable";

type Option = {
  label: string;
  value: string;
};

export type InlineAutoCompleteProps = {
  onChange: (
    val: ValueType<OptionTypeBase, false> | string,
    action: ActionMeta<OptionTypeBase> | InputActionMeta
  ) => void;
  options: Option[];
  defaultValue: string;
  isLoading: boolean;
};

const styles: Partial<Styles> = {
  option: (provided, state) => ({
    ...provided,
    borderBottom: "1px dotted black",
    padding: 1,
  }),
  control: () => ({
    // none of react-select's styles are passed to <Control />
    width: 200,
    height: 24,
    border: 0,
    padding: 0,
    margin: 0
  }),
  dropdownIndicator: () => ({
    display: "none",
    height: 0,
  }),
  clearIndicator: () => ({
    display: "none",
    height: 0,
  }),
  singleValue: (provided, state) => {
    const opacity = state.isDisabled ? 0.5 : 1;
    const transition = "opacity 300ms";

    return { ...provided, opacity, transition };
  },
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

export default (props: InlineAutoCompleteProps) => {
  const { onChange, options, defaultValue, isLoading } = props;
  const [isEditing, setIsEditing] = React.useState(false);
  const toggleEdit = React.useCallback(() => setIsEditing(!isEditing), [
    isEditing,
    setIsEditing,
  ]);
  const enterHandler = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) =>
      event.key === "Enter" && toggleEdit(),
    [toggleEdit]
  );
  const submitChange = React.useCallback(
    (
      val: ValueType<OptionTypeBase, false> | string,
      action: ActionMeta<OptionTypeBase> | InputActionMeta
    ) => {
      if (
        action.action === "create-option" ||
        action.action === "select-option"
      ) {
        onChange(val, action);
        setIsEditing(false);
      }
    },
    [setIsEditing, onChange]
  );

  return (
    <div
      onClick={toggleEdit}
      onKeyDown={enterHandler}
      role="button"
      tabIndex={0}
    >
      {isLoading ? (
        <Spinner size="xs" />
      ) : isEditing ? (
        <CreatableSelect
          styles={styles}
          isClearable={false}
          isLoading={isLoading}
          defaultValue={{ label: defaultValue, value: defaultValue }}
          options={options}
          onChange={submitChange}
          autoFocus
          menuPortalTarget={document.body}
          menuShouldScrollIntoView={false}
        />
      ) : (
        <div>{defaultValue}</div>
      )}
    </div>
  );
};
