import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import ViolinPlot from '../../src/charts/ViolinPlot.svelte'

const data = [
  { category: 'A', value: 10 }, { category: 'A', value: 30 }, { category: 'A', value: 50 },
  { category: 'B', value: 20 }, { category: 'B', value: 40 }, { category: 'B', value: 60 }
]

describe('ViolinPlot', () => {
  it('renders without errors', () => {
    const { container } = render(ViolinPlot, { data, x: 'category', y: 'value' })
    expect(container).toBeTruthy()
  })

  it('renders an SVG', () => {
    const { container } = render(ViolinPlot, { data, x: 'category', y: 'value' })
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('renders violin paths', () => {
    const { container } = render(ViolinPlot, { data, x: 'category', y: 'value' })
    expect(container.querySelectorAll('[data-chart-element="violin"]').length).toBeGreaterThan(0)
  })
})
