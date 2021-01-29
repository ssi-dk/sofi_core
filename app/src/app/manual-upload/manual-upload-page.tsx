import React, { useState } from "react";
import { Spacer, Box, Flex, Heading } from "@chakra-ui/react"
import UploadForm from "./upload-form"

export default function ManualUploadPage() {
  return (
    <Flex
      direction="column"
      align="center"
      maxW={{ xl: "1200px" }}
      m="0 auto"

    >
      <Box minW="100%" flexShrink={0}>
        <Heading>SOFI</Heading>
      </Box>
      
      <Spacer />

      <UploadForm />
    </Flex>
  );
}
