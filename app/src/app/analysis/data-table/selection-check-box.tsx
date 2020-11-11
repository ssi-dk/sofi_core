/** @jsx jsx */
import React, { DetailedHTMLProps, forwardRef, useEffect } from 'react';
import { jsx } from "@emotion/core";
import { css } from '@emotion/core';

const checkboxStyle = css({
  margin: "0.8rem"
});

type SelectionCheckBoxProps = DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
    checked?: boolean;
    indeterminate?: boolean;
    onClick?: () => void;
}

const SelectionCheckBox = forwardRef(({ indeterminate, checked, ...rest }: SelectionCheckBoxProps, ref) => {
  const defaultRef = React.useRef<HTMLInputElement>();
  const resolvedRef = (ref || defaultRef) as React.MutableRefObject<HTMLInputElement>;

  useEffect(() => {
    resolvedRef.current.indeterminate = indeterminate;
    resolvedRef.current.checked = checked;
  }, [resolvedRef, indeterminate]);

  return (
      <input css={checkboxStyle} type="checkbox" ref={resolvedRef} {...rest} />
  );
});

export default SelectionCheckBox;