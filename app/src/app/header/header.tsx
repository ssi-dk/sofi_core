import React from "react";
import { Box, Heading, Flex } from "@chakra-ui/react";
import NavBar from "./nav-bar";
import AccountManager from "./account-manager";

type HeaderProps = {
  sidebarWidth?: string;
};

function Header({ sidebarWidth }: HeaderProps) {
  return (
    <Flex align="center" justify="space-between">
      <Box minW={sidebarWidth || "300px"} flexShrink={0}>
        <Heading>SOFI</Heading>
      </Box>
      <NavBar />
      <AccountManager />
    </Flex>
  );
}

export default Header;
