import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import ViolinPlot from '../../src/charts/ViolinPlot.svelte'

const data = [
  { category: 'A', value: 10 }, { category: 'A', value: 20 },
  { category: 'A', value: 30 }, { category: 'A', value: 40 },
  { category: 'B', value: 5  }, { category: 'B', value: 15 },
  { category: 'B', value: 25 }, { category: 'B', value: 35 }
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

  it('renders a plot container', () => {
    const { container } = render(ViolinPlot, { data, x: 'category', y: 'value' })
    expect(container.querySelector('[data-plot-root]')).toBeTruthy()
  })

  it('renders violin path elements (one per category)', () => {
    const { container } = render(ViolinPlot, { data, x: 'category', y: 'value' })
    const violins = container.querySelectorAll('[data-plot-element="violin"]')
    expect(violins.length).toBe(2)
  })

  it('violin path d has no NaN', () => {
    const { container } = render(ViolinPlot, { data, x: 'category', y: 'value' })
    const violins = container.querySelectorAll('[data-plot-element="violin"]')
    for (const v of violins) {
      const d = v.getAttribute('d')
      expect(d).toBeTruthy()
      expect(d).not.toContain('NaN')
    }
  })

  it('violin path d is a non-trivial path (has M and C/L commands)', () => {
    const { container } = render(ViolinPlot, { data, x: 'category', y: 'value' })
    const [violin] = container.querySelectorAll('[data-plot-element="violin"]')
    const d = violin.getAttribute('d')
    expect(d).toMatch(/M/)
    expect(d.length).toBeGreaterThan(10)
  })
})
