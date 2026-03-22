import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import AreaChart from '../../src/charts/AreaChart.svelte'

const data = [
  { month: 'Jan', revenue: 100 },
  { month: 'Feb', revenue: 200 },
  { month: 'Mar', revenue: 150 }
]

describe('AreaChart', () => {
  it('renders without errors', () => {
    const { container } = render(AreaChart, { data, x: 'month', y: 'revenue' })
    expect(container).toBeTruthy()
  })

  it('renders an SVG element', () => {
    const { container } = render(AreaChart, { data, x: 'month', y: 'revenue' })
    expect(container.querySelector('svg')).toBeTruthy()
  })
})
