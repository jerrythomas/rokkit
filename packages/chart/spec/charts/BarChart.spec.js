import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import BarChart from '../../src/charts/BarChart.svelte'

const data = [
  { category: 'A', revenue: 100 },
  { category: 'B', revenue: 200 },
  { category: 'C', revenue: 150 }
]

describe('BarChart', () => {
  it('renders without errors', () => {
    const { container } = render(BarChart, { data, x: 'category', y: 'revenue' })
    expect(container).toBeTruthy()
  })

  it('renders an SVG element', () => {
    const { container } = render(BarChart, { data, x: 'category', y: 'revenue' })
    expect(container.querySelector('svg')).toBeTruthy()
  })
})
