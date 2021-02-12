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
  visible?: boolean;
  onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
};

const SelectionCheckBox = forwardRef(
  (
    { indeterminate, checked, visible, ...rest }: SelectionCheckBoxProps,
    ref
  ) => {
    const defaultRef = React.useRef<HTMLInputElement>();
    const resolvedRef = (ref ||
      defaultRef) as React.MutableRefObject<HTMLInputElement>;

    useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
      resolvedRef.current.checked = checked;
      resolvedRef.current.style.visibility =
        visible !== false ? "visible" : "hidden";
    }, [resolvedRef, indeterminate, checked, visible]);

    return (
      <input css={checkboxStyle} type="checkbox" ref={resolvedRef} {...rest} />
    );
  }
);

export default React.memo(SelectionCheckBox);
