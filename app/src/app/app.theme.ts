import { theme } from "@chakra-ui/core";

export default {
  ...theme,
  colors: {
    ...theme.colors,
  },
  borders: {
    ...theme.borders,
    "1px": "1px solid rgba(0,0,0,0.05)",
    "2px": "2px solid rgba(0,0,0,0.05)",
  }
};
