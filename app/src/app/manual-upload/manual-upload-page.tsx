import React, { useState } from "react";
import { Flex } from "@chakra-ui/react"
import UploadForm from "./upload-form"

export default function ManualUploadPage() {
  return (
    <Flex
      direction="column"
      align="center"
      maxW={{ xl: "1200px" }}
      m="0 auto"

    >
      <UploadForm />
    </Flex>
  );
}
