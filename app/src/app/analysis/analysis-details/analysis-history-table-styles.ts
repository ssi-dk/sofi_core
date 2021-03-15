import { css } from "@emotion/react";
import { theme } from "@chakra-ui/react";

export const tableBorders = css({
  border: "1px solid gray",
  width: "250px",
  maxWidth: "250px",
  minWidth: "250px",
});

export const overflowWrapper = css({
  overflowX: "auto",
});

export const tableStyle = css({
  borderCollapse: "collapse",
  borderStyle: "hidden",
  "th:nth-of-type(odd)": {
    background: theme.colors.gray[100],
  },
  "td:nth-of-type(odd)": {
    background: theme.colors.gray[100],
  },
});
