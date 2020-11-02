import { css } from "@emotion/core";

export const borderStyle = "1px solid black";

export const cell = css({
  margin: 0,
  width: "1%",
  padding: "0.5rem",
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  borderBottom: borderStyle,
  borderRight: borderStyle,
  ":last-child": {
    borderRight: borderStyle,
  },
});

export default css({
  display: "block",
  maxWidth: "100%",
  ".tableWrap": {
    display: "block",
    maxWidth: "100%",
    overflowX: "scroll",
    overflowY: "hidden",
    borderBottom: borderStyle
  },
  table: {
    width: "100%",
    borderSpacing: 0,
    border: borderStyle,
  },
  tr: {
    ":last-child": {
      td: {
        borderBottom: 0,
      },
    },
  },
  th: { ...cell },
  td: { ...cell },
});
