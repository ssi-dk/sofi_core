import React from "react";
import { Box } from "@chakra-ui/react";
import Header from "../app/header/header";

type HalfHolyGrailLayoutProps = {
  sidebarWidth?: string;
  sidebar: React.ReactChild;
  content: React.ReactChild;
};

/**
 * Top-level layout component for a page with header and left sidebar
 */
const HalfHolyGrailLayout = (props: HalfHolyGrailLayoutProps) => {
  const sidebarWidth = props.sidebarWidth ?? props.sidebar ? "300px" : "0px";
  const { content, sidebar } = props;
  return (
    <Box
      display="grid"
      gridTemplateRows="5% 5% minmax(0, 80%) 10%"
      gridTemplateColumns={`${sidebarWidth} auto`}
      padding="8"
      height="100vh"
      gridGap="2"
      rowgap="5"
    >
      <Box role="heading" gridColumn="1 / 4">
        <Header sidebarWidth={sidebarWidth} />
      </Box>
      <Box role="form" gridColumn="1 / 2">
        <Box minW={sidebarWidth} maxW={sidebarWidth} pr={5}>
          {sidebar}
        </Box>
      </Box>
      <Box gridColumn="2 / 4">{content}</Box>
    </Box>
  );
};

export default React.memo(HalfHolyGrailLayout);
