import React, { useState } from "react";

import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spacer,
  Box,
  Flex,
  Heading,
} from "@chakra-ui/react";
import SingleUploadForm from "./single-upload-form";
import MultiUploadForm from "./multi-upload-form";
import BulkUploadForm from "./bulk-upload-form";
import Header from "../header/header";

export default function ManualUploadPage() {
  return (
    <Box
      display="grid"
      gridTemplateRows="10% auto"
      gridTemplateColumns="18rem auto 18rem"
      padding="8"
      height="100vh"
      gridGap="5"
    >
      <Box role="heading" gridColumn="1 / 3">
        <Header sidebarWidth="300px" />
      </Box>
      <Box gridColumn="2 / 2">
        <Tabs variant="soft-rounded">
          <TabList>
            <Tab _selected={{ bg: "blue.100" }}>Single upload</Tab>
            <Tab _selected={{ bg: "blue.100" }}>Multi upload</Tab>
            <Tab _selected={{ bg: "blue.100" }}>Bulk metadata upload</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <SingleUploadForm />
            </TabPanel>
            <TabPanel>
              <MultiUploadForm />
            </TabPanel>
            <TabPanel>
              <BulkUploadForm />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
}
