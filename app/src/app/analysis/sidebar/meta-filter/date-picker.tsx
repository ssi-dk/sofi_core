import React from "react";
import ReactDatePicker, { ReactDatePickerProps } from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import "./date-picker.css";

interface Props {
  isClearable?: boolean;
  onChange: (date: Date) => void;
  selectedDate: Date | undefined;
  showPopperArrow?: boolean;
  isDisabled: boolean;
}

const DatePicker = ({
  selectedDate,
  onChange,
  isClearable = false,
  showPopperArrow = false,
  isDisabled,
  ...props
}: Props & ReactDatePickerProps) => {
  return (
    <ReactDatePicker
      dateFormat="yyyy-MM-dd"
      selected={selectedDate}
      onSelect={onChange}
      onChange={onChange}
      isClearable={isClearable}
      showPopperArrow={showPopperArrow}
      disabled={isDisabled}
      {...props}
    />
  );
};

export default DatePicker;
