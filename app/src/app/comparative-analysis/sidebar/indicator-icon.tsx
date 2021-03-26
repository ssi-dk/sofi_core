import React from "react";
import { Icon, ColorProps } from "@chakra-ui/react";

function IndicatorIcon(props: ColorProps) {
  return (
    <Icon viewBox="0 0 200 200" {...props}>
      <path
        fill="currentColor"
        d="M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0"
      />
    </Icon>
  );
}

export default React.memo(IndicatorIcon);
