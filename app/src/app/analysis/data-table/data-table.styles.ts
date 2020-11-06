import { css } from "@emotion/core";

export const cell = css({
  margin: 0,
  width: "1%",
  padding: "0.8rem",
  overflow: "hidden",
  whiteSpace: "nowrap",
  fontSize: "15px",
  textAlign: "left",
  textOverflow: "ellipsis",
  ":last-child": {},
});

export default css({
  display: "block",
  maxWidth: "100%",
  ".tableWrap": {
    display: "block",
    maxWidth: "100%",
    overflowX: "hidden",
    overflowY: "hidden",
  },
  table: {
    width: "100%",
    borderSpacing: 0,
  },
  tr: {
    ":last-child": {
      td: {
        borderBottom: 0,
      },
    },
    borderBottom: "1px solid rgba(0,0,0,0.05)",
  },
  thead: {
    borderBottom: "2px solid rgba(0,0,0,0.05)",
  },
  th: { ...cell },
  td: { ...cell },
});
