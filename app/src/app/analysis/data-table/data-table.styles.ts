import { css, keyframes } from "@emotion/react";
import theme from "app/app.theme";
import {
  DraggableStateSnapshot,
  DraggingStyle,
  NotDraggingStyle,
} from "react-beautiful-dnd";

export const getColumnStyle = (
  { isDragging, isDropAnimating }: DraggableStateSnapshot,
  draggableStyle: DraggingStyle | NotDraggingStyle
) =>
  css({
    ...draggableStyle,
    userSelect: "none",
    // prevent react-beautiful-dnd from blowing columns all over the place
    ...(!isDragging && { transform: "translate(0,0) !important" }),
    ...(!isDropAnimating && { transitionDuration: "0.001s" }),
    textAlign: "left",
    textOverflow: "ellipsis",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  });

export const headerButton = css({
  flex: "0 0 16px",
  verticalAlign: "center",
  alignSelf: "center",
});

export const headerName = css({
  verticalAlign: "center",
  flex: "1 1 auto",
  overflow: "hidden",
  textAlign: "center",
  textOverflow: "ellipsis",
});

export const cell = css({
  margin: "2px",
  width: "1%",
  padding: "0.8rem",
  overflow: "hidden",
  whiteSpace: "nowrap",
  fontSize: "15px",
  textAlign: "left",
  textOverflow: "ellipsis",
  ":last-child": {},
});

const ants = keyframes`to { background-position: 100% 100% }`;

export const selectedCell = css({
  border: "1px solid transparent",
  margin: "2px",
  background: `linear-gradient(white, white) padding-box,
     repeating-linear-gradient(-45deg, black 0, black 25%, transparent 0, transparent 50%) 0 / .6em .6em`,
  animation: `${ants} 10s linear infinite`,
  fontWeight: "bold",
  maxWidth: "20em",
  borderBottom: "1px solid transparent",
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
    height: "100%",
  }),
  "[role=columnheader]": css(
    {
      display: "flex",
      alignItems: "center",
      fontWeight: "bold",
      borderBottom: theme.borders["2px"],
      userSelect: "none",
    },
    cell
  ),
  "div[role=cell]": { ...cell },
});
