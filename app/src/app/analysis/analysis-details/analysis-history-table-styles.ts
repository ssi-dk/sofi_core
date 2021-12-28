// Theme values cannot be statically evaluated
const gray = "#EDF2F7"; // theme.colors.gray[100];

export const tableBorders = {
  border: "1px solid gray",
  width: "250px",
  maxWidth: "250px",
  minWidth: "250px",
};

export const overflowWrapper = {
  overflowX: "auto",
};

export const tableStyle = {
  borderCollapse: "collapse",
  borderStyle: "hidden",
  "th:nth-of-type(odd)": {
    background: gray,
  },
  "td:nth-of-type(odd)": {
    background: gray,
  },
};
