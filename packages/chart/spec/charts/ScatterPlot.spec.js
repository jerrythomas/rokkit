import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import ScatterPlot from '../../src/charts/ScatterPlot.svelte'

const data = [
  { x: 1, y: 10 },
  { x: 5, y: 25 },
  { x: 3, y: 15 }
]

describe('ScatterPlot', () => {
  it('renders without errors', () => {
    const { container } = render(ScatterPlot, { data, x: 'x', y: 'y' })
    expect(container).toBeTruthy()
  })

  it('renders an SVG element', () => {
    const { container } = render(ScatterPlot, { data, x: 'x', y: 'y' })
    expect(container.querySelector('svg')).toBeTruthy()
  })
})
