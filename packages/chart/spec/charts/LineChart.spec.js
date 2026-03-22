import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import LineChart from '../../src/charts/LineChart.svelte'

const data = [
  { month: 'Jan', revenue: 100 },
  { month: 'Feb', revenue: 200 },
  { month: 'Mar', revenue: 150 }
]

describe('LineChart', () => {
  it('renders without errors', () => {
    const { container } = render(LineChart, { data, x: 'month', y: 'revenue' })
    expect(container).toBeTruthy()
  })

  it('renders an SVG element', () => {
    const { container } = render(LineChart, { data, x: 'month', y: 'revenue' })
    expect(container.querySelector('svg')).toBeTruthy()
  })
})
