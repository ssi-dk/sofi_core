/** @jsxImportSource @compiled/react */
import React, { DetailedHTMLProps, forwardRef, useEffect } from "react";
import "@compiled/react";

const checkboxStyle = {
  marginLeft: "5px",
  marginRight: "5px",
};

type SelectionCheckBoxProps = DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  checked?: boolean;
  indeterminate?: boolean;
  visible?: boolean;
  // Change this value to force a rerender
  renderTrigger?: boolean;
  onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
};

const SelectionCheckBox = forwardRef(
  (
    { indeterminate, checked, visible, renderTrigger, ...rest }: SelectionCheckBoxProps,
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
    }, [resolvedRef, indeterminate, checked, visible, renderTrigger]);

    return (
      <input
        css={checkboxStyle}
        type="checkbox"
        ref={resolvedRef}
        {...(rest as any)}
      />
    );
  }
);

export default React.memo(SelectionCheckBox);
