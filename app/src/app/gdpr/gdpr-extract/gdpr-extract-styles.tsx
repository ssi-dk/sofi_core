import { css } from "@emotion/react";
import theme from "app/app.theme";

export const inputForm = css({
  boxSizing: "border-box",
  alignSelf: "flex-start",
  paddingTop: "1rem",
});

export const rightPane = css({
  boxSizing: "border-box",
  height: "100vh",
  paddingTop: "1rem",
  paddingLeft: "2rem",
  width: "100%",
});

export const dataView = css({
  overflowY: "scroll",
  height: "calc(100% - 2rem)",
});
