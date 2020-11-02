import React from 'react'
import { Box, Heading, Flex } from '@chakra-ui/core'
import AnalysisSearch from './search/analysis-search'
import AnalysisViewSelector from './view-selector/analysis-view-selector'

export default function AnalysisHeader({sidebarWidth}) {
    return <Flex align="center">
        <Box minW={sidebarWidth} flexShrink={0}>
            <Heading >SAP</Heading>
        </Box>
        <AnalysisSearch />
        <Box minW="250px" ml="10">
            <AnalysisViewSelector />
        </Box>
    </Flex>
}
