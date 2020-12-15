import React from "react";
import { Global } from "@emotion/react";
import { ChakraProvider, Box } from "@chakra-ui/react";
import { Switch, Route } from "react-router";
import appTheme from "app/app.theme";
import { globalCss } from "./app.styles";
import "./i18n";
import AnalysisPage from "./analysis/analysis-page";
import ApprovalHistory from "./history/approval-history";

export default function App() {
  return (
    <ChakraProvider theme={appTheme}>
      <Global styles={globalCss} />
      <Switch>
        <Route
          exact
          path="/approval-history"
          render={() => <ApprovalHistory />}
        />
        <Route path="/" render={() => <AnalysisPage />} />
      </Switch>
    </ChakraProvider>
  );
}
