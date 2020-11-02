/** @jsx jsx */
import { useDispatch } from "react-redux";
import { Global, jsx } from "@emotion/core";
import { flex, reset } from "./app.styles";

import Analysis from "./analysis/analysis";
import appTheme from "app/app.theme"
import { ThemeProvider, CSSReset, Box } from "@chakra-ui/core";

export default function App() {
  const dispatch = useDispatch();

  return (
    <ThemeProvider theme={appTheme}>
      <CSSReset />
      <Box p={6}>
        <Analysis />
      </Box>
    </ThemeProvider>
  );
}
