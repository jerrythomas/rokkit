import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import BubbleChart from '../../src/charts/BubbleChart.svelte'

const data = [
  { country: 'A', gdp: 10, life: 70, population: 100 },
  { country: 'B', gdp: 20, life: 75, population: 200 },
  { country: 'C', gdp: 15, life: 72, population: 150 }
]

describe('BubbleChart', () => {
  it('renders without errors', () => {
    const { container } = render(BubbleChart, { data, x: 'gdp', y: 'life', size: 'population' })
    expect(container).toBeTruthy()
  })

  it('renders an SVG', () => {
    const { container } = render(BubbleChart, { data, x: 'gdp', y: 'life', size: 'population' })
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('renders a plot container', () => {
    const { container } = render(BubbleChart, { data, x: 'gdp', y: 'life', size: 'population' })
    expect(container.querySelector('[data-plot-root]')).toBeTruthy()
  })
})
