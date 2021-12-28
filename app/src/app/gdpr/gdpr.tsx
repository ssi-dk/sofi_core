import React, { ChangeEvent, useState } from "react";
import "@compiled/react";
import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Box,
  Flex,
} from "@chakra-ui/react";
import { IfPermission } from "auth/if-permission";
import { Permission } from "sap-client";
import { useTranslation } from "react-i18next";
import GdprExtractPage from "./gdpr-extract/gdpr-extract-page";
import GdprForgetPage from "./gdpr-forget/gdpr-forget-page";
import Header from "../header/header";

const GdprPage = () => {
  const { t } = useTranslation();
  return (
    <IfPermission permission={Permission.approve}>
      <Box
        display="grid"
        gridTemplateRows="10% auto"
        gridTemplateColumns="15rem auto 15rem"
        padding="8"
        height="100vh"
        gridGap="5"
      >
        <Box role="heading" gridColumn="1 / 4">
          <Header sidebarWidth="300px" />
        </Box>
        <Box gridColumn="2 / 2" height="80vh">
          <Tabs variant="soft-rounded">
            <TabList>
              <Tab _selected={{ bg: "blue.100" }}>
                {t("Extract personal data")}
              </Tab>
              <Tab _selected={{ bg: "blue.100" }}>
                {t("Delete personal data")}
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <GdprExtractPage />
              </TabPanel>
              <TabPanel>
                <GdprForgetPage />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Box>
    </IfPermission>
  );
};
export default GdprPage;
