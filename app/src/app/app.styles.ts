import { css } from "@emotion/core";

export const flex = css({
  display: "flex",
  flex: "1 1 1",
  alignContent: "center",
  alignSelf: "center",
  flexDirection: "column",
  height: "100vh",
});

export const reset = css({
  body: {
    margin: 0,
    padding: 0,
    fontFamily: "sans-serif",
    backgroundColor: "#FAFAFA",
  },
  "*": {
    boxSizing: "border-box",
  },
});

export const globalCss = css({
  body: {
    backgroundColor: "#FDFDFD",
  },
  // ".react-datepicker-wrapper": {
  //   border: "1px solid #e2e8f0",
  //   borderRadius: "4px",
  //   padding: "7px",
  //   backgroundColor: "white"
  // },
});

export function selectTheme(theme) {
  return {
    ...theme,
    colors: {
      ...theme.colors,
      primary: "#3182ce",
      neutral20: "#e2e8f0",
    },
  };
}
