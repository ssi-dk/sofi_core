import React from "react";
import { render } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "app/app.theme";

const AllTheProviders = ({ children }) => {
  return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
};

const customRender = (ui, options?) =>
  render(ui, {
    wrapper: AllTheProviders,
    ...options,
  });

// re-export everything
export * from "@testing-library/react";

// override render method
export { customRender as render };
