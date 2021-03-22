import React from "react";
import { Global } from "@emotion/react";
import { ChakraProvider } from "@chakra-ui/react";
import { Switch, Route } from "react-router";
import { Authorize } from "auth/authorize";
import appTheme from "app/app.theme";
import { Callback } from "auth/auth-callback";
import { globalCss } from "./app.styles";
import "./i18n";
import AnalysisPage from "./analysis/analysis-page";
import ApprovalHistory from "./approval-history/approval-history";
import ManualUploadPage from "./manual-upload/manual-upload-page";
import GdprPage from "./gdpr/gdpr";
import Tree from "./phylo/phylo";

export default function App() {
  return (
    <ChakraProvider theme={appTheme}>
      <Global styles={globalCss} />
      <Switch>
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
          path="/gdpr"
          render={() => (
            <Authorize>
              <GdprPage />
            </Authorize>
          )}
        />
        <Route
          exact
          path="/callback"
          render={() => <Callback location={window.location} />}
        />
        <Route
          exact
          path="/phylo"
          render={() => (
            <Tree
              leaf_colors={{}}
              actions={{}}
              selectedIDs={[]}
              newick_data="(Bovine:1.69395,(Hylobates:0.36079,(Pongo:0.33636,(G._Gorilla:0.17147, (P._paniscus:0.19268,H._sapiens:0.11927):0.08386):0.06124):0.15057):0.54939, Rodent:1.21460);"
            />
          )}
        />
        <Route
          path="/"
          render={() => (
            <Authorize>
              <AnalysisPage />
            </Authorize>
          )}
        />
      </Switch>
    </ChakraProvider>
  );
}
