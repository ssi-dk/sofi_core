import React from 'react'
import { Box, Heading, Flex } from '@chakra-ui/core'

export default function AnalysisHeader({sidebarWidth}) {
    return <Flex>
        <Heading w={sidebarWidth + "%"}>SAP</Heading>
        <Heading>Search...</Heading>
    </Flex>
}
