import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import BoxPlot from '../../src/charts/BoxPlot.svelte'

const data = [
  { category: 'A', value: 10 }, { category: 'A', value: 30 }, { category: 'A', value: 50 },
  { category: 'B', value: 20 }, { category: 'B', value: 40 }, { category: 'B', value: 60 }
]

describe('BoxPlot', () => {
  it('renders without errors', () => {
    const { container } = render(BoxPlot, { data, x: 'category', y: 'value' })
    expect(container).toBeTruthy()
  })

  it('renders an SVG element', () => {
    const { container } = render(BoxPlot, { data, x: 'category', y: 'value' })
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('renders a plot container', () => {
    const { container } = render(BoxPlot, { data, x: 'category', y: 'value' })
    expect(container.querySelector('[data-plot-root]')).toBeTruthy()
  })
})
