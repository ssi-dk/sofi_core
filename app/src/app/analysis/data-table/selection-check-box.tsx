/** @jsxRuntime classic */
/** @jsx jsx */
import React, { DetailedHTMLProps, forwardRef, useEffect } from "react";
import { css, jsx } from "@emotion/react";

const checkboxStyle = css({
  marginLeft: "5px",
  marginRight: "5px",
});

type SelectionCheckBoxProps = DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  checked?: boolean;
  indeterminate?: boolean;
  onClick?: () => void;
};

const SelectionCheckBox = forwardRef(
  ({ indeterminate, checked, ...rest }: SelectionCheckBoxProps, ref) => {
    const defaultRef = React.useRef<HTMLInputElement>();
    const resolvedRef = (ref || defaultRef) as React.MutableRefObject<
      HTMLInputElement
    >;

    useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
      resolvedRef.current.checked = checked;
    }, [resolvedRef, indeterminate, checked]);

    return (
      <input css={checkboxStyle} type="checkbox" ref={resolvedRef} {...rest} />
    );
  }
);

export default SelectionCheckBox;
