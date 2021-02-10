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
import { useSelector } from "react-redux";
import SingleUploadForm from "./single-upload-form";
import MultiUploadForm from "./multi-upload-form";
import BulkUploadForm from "./bulk-upload-form";
import Header from "../header/header";


const getUploadErrors = state => state.entities.manualUploadErrors;

export default function ManualUploadPage() {
  const uploadErrors = useSelector(getUploadErrors);

  return (
    <Box
      display="grid"
      gridTemplateRows="10% auto"
      gridTemplateColumns="30rem auto 5rem"
      padding="8"
      height="100vh"
      gridGap="5"
    >
      <Box role="heading" gridColumn="1 / 4">
        <Header sidebarWidth="300px" />
      </Box>
      <Box gridColumn="1" gridRow="2" overflowY="auto">
        {(uploadErrors && <pre>{uploadErrors}</pre>)}
      </Box>
      <Box gridColumn="2 / 2" overflowY="auto">
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
