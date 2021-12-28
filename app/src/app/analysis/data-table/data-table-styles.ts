const border1Px = "1px solid rgba(0,0,0,0.05)";
const border2Px = "1px solid rgba(0,0,0,0.05)";

export const columnStyle = {
  userSelect: "none",
  // prevent react-beautiful-dnd from blowing columns all over the place
  textAlign: "left",
  textOverflow: "ellipsis",
  position: "sticky",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

export const headerButton = {
  flex: "0 0 16px",
  verticalAlign: "center",
  alignSelf: "center",
};

export const headerName = {
  verticalAlign: "center",
  flex: "1 1 auto",
  overflow: "hidden",
  textAlign: "center",
  textOverflow: "ellipsis",
};

export const cell = {
  width: "1%",
  overflow: "hidden",
  whiteSpace: "nowrap",
  fontSize: "15px",
  textAlign: "left",
  textOverflow: "ellipsis",
  ":last-child": {},
};

export const dteeStyle = {
  display: "block",
  maxWidth: "100%",
  "div[role=table]": {
    borderSpacing: 0,
  },
  "div[role=row]": {
    ":last-child": {
      td: {
        borderBottom: 0,
      },
    },
    borderBottom: border1Px,
  },
  "div[role=rowgroup]": {
    borderBottom: border2Px,
    width: "100%",
  },
  "div[role=separator]": {
    position: "absolute",
    display: "inline-block",
    right: 0,
    top: 0,
    width: "1ch",
    height: "100%",
  },
  "[role=columnheader]": {
    backgroundColor: "#fff",
    display: "flex",
    alignItems: "center",
    fontWeight: "bold",
    borderBottom: border2Px,
    borderRight: border2Px,
    height: "100%",
    userSelect: "none",
  },
};

export const dtStyle = {
  display: "block",
  maxWidth: "100%",
  ".tableWrap": {
    display: "block",
    width: "100%",
  },
  "div[role=table]": {
    borderSpacing: 0,
  },
  "div[role=row]": {
    ":last-child": {
      td: {
        borderBottom: 0,
      },
    },
    borderBottom: border1Px,
  },
  "div[role=rowgroup]": {
    borderBottom: border2Px,
    width: "100%",
  },
  "div[role=separator]": {
    position: "absolute",
    display: "inline-block",
    right: 0,
    top: 0,
    width: "1ch",
    height: "100%",
  },
  "[role=columnheader]": {
    backgroundColor: "#fff",
    display: "flex",
    alignItems: "center",
    fontWeight: "bold",
    borderBottom: border2Px,
    borderRight: border2Px,
    height: "100%",
    userSelect: "none",
    /* But "collapsed" cells should be as small as possible */
    "&.collapse": {
      width: "0.0000000001%",
    },
    ...cell,
  },
  "div[role=cell]": { ...cell },
};
