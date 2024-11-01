import React from "react";
import "@compiled/react";
import { ChakraProvider } from "@chakra-ui/react";
import { Route } from "react-router";
import { CacheSwitch, CacheRoute } from "react-router-cache-route";
import { Authorize } from "auth/authorize";
import appTheme from "app/app.theme";
import { Callback } from "auth/auth-callback";
import "./i18n";
import AnalysisPage from "./analysis/analysis-page";
import ApprovalHistory from "./approval-history/approval-history";
import ManualUploadPage from "./manual-upload/manual-upload-page";
import GdprPage from "./gdpr/gdpr";
import ComparativeAnalysis from "./comparative-analysis/comparative-analysis";
import "./style-reset.css";
import { Workspaces } from "./workspaces/workspaces";
import { Workspace } from "./workspaces/workspace";
import { CreateWorkspaceFromMicroreact } from "./workspaces/create-workspace-from-microreact";

export default function App() {
  return (
    <ChakraProvider theme={appTheme}>
      <CacheSwitch>
        <Route
          path="/manual-upload"
          render={() => (
            <Authorize>
              <ManualUploadPage />
            </Authorize>
          )}
        />
        <Route
          exact
          path="/approval-history"
          render={() => (
            <Authorize>
              <ApprovalHistory />
            </Authorize>
          )}
        />
        <Route
          exact
          path="/workspaces"
          render={() => (
            <Authorize>
              <Workspaces />
            </Authorize>
          )}
        />
        <Route
          exact
          path="/workspaces/:id"
          render={(params) => (
            <Authorize>
              <Workspace id={params.match.params.id} />
            </Authorize>
          )}
        />
        <Route
          exact
          path="/createworkspace"
          render={() => (
            <Authorize>
              <CreateWorkspaceFromMicroreact />
            </Authorize>
          )}
        />
        <Route
          exact
          path="/gdpr"
          render={() => (
            <Authorize>
              <GdprPage />
            </Authorize>
          )}
        />
        <Route
          exact
          path="/phylo"
          render={() => (
            <Authorize>
              <ComparativeAnalysis />
            </Authorize>
          )}
        />
        <Route
          exact
          path="/callback"
          render={() => <Callback location={window.location} />}
        />
        <CacheRoute
          path="/"
          render={() => (
            <Authorize>
              <AnalysisPage />
            </Authorize>
          )}
        />
      </CacheSwitch>
    </ChakraProvider>
  );
}
