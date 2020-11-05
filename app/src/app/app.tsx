/** @jsx jsx */
import { useDispatch } from "react-redux";
import { Global, jsx, css } from "@emotion/core";
import "./i18n";
import appTheme from "app/app.theme";
import { ThemeProvider, CSSReset, Box } from "@chakra-ui/core";
import Analysis from "./analysis/analysis";
import { flex, reset, globalCss } from "./app.styles";

export default function App() {
  const dispatch = useDispatch();

  return (
    <ThemeProvider theme={appTheme}>
      <CSSReset />
      <Global styles={globalCss} />
      <Box p={6}>
        <Analysis />
      </Box>
    </ThemeProvider>
  );
}
