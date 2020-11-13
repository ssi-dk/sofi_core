import { css } from "@emotion/core";
import { flex } from "app/app.styles";
import theme from "app/app.theme";

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

export const selectedCell = css({
  backgroundColor: theme.colors.blue[200]
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
  "div[role=table]": {
    width: "100%",
    borderSpacing: 0,
  },
  "div[role=row]": {
    ":last-child": {
      td: {
        borderBottom: 0,
      },
    },
    borderBottom: theme.borders["1px"],
  },
  "div[role=rowgroup]": {
    borderBottom: theme.borders["2px"],
  },
  "div[role=separator]": css({
    borderLeft: theme.borders["2px"],
    position: "absolute",
    display: "inline-block",
    right: 0,
    top: 0,
    width: "1ch",
    height: "100%"
  }),
  "[role=columnheader]": css({
    fontWeight: 'bold',
    borderBottom: theme.borders["2px"],
  }, cell),
  "div[role=cell]": { ...cell }
});
