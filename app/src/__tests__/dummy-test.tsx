import React from 'react'
import { screen } from '@testing-library/react'
import { render } from '../test-utils'
import AnalysisHeader from 'app/analysis/header/analysis-header'

it('Checks header for SAP', () => {
  render(<AnalysisHeader sidebarWidth="300px"/>)
  expect(screen.getByText('SOMENOTSAP')).toBeInTheDocument()
})