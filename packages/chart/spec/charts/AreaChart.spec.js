import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import AreaChart from '../../src/charts/AreaChart.svelte'

const timeSeries = [
  { month: 3, revenue: 150 },
  { month: 1, revenue: 100 },
  { month: 2, revenue: 200 }
]

const multiSeries = [
  { month: 2, category: 'A', val: 20 },
  { month: 1, category: 'A', val: 10 },
  { month: 2, category: 'B', val: 40 },
  { month: 1, category: 'B', val: 30 }
]

describe('AreaChart', () => {
  it('renders without errors', () => {
    const { container } = render(AreaChart, { data: timeSeries, x: 'month', y: 'revenue' })
    expect(container).toBeTruthy()
  })

  it('renders an SVG element', () => {
    const { container } = render(AreaChart, { data: timeSeries, x: 'month', y: 'revenue' })
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('renders a path element for the area', () => {
    const { container } = render(AreaChart, { data: timeSeries, x: 'month', y: 'revenue' })
    const paths = container.querySelectorAll('[data-plot-element="area"]')
    expect(paths.length).toBeGreaterThanOrEqual(1)
  })

  it('area path d has no NaN (data sorted before drawing)', () => {
    const { container } = render(AreaChart, { data: timeSeries, x: 'month', y: 'revenue' })
    const paths = container.querySelectorAll('[data-plot-element="area"]')
    for (const path of paths) {
      const d = path.getAttribute('d')
      expect(d).toBeTruthy()
      expect(d).not.toContain('NaN')
    }
  })

  it('renders one area per fill group when fill prop provided', () => {
    const { container } = render(AreaChart, {
      data: multiSeries, x: 'month', y: 'val', fill: 'category'
    })
    const paths = container.querySelectorAll('[data-plot-element="area"]')
    expect(paths.length).toBe(2)
  })

  it('renders stacked areas without NaN paths when stack=true', () => {
    const { container } = render(AreaChart, {
      data: multiSeries, x: 'month', y: 'val', fill: 'category', stack: true
    })
    const paths = container.querySelectorAll('[data-plot-element="area"]')
    expect(paths.length).toBe(2)
    for (const path of paths) {
      expect(path.getAttribute('d')).not.toContain('NaN')
    }
  })

  it('renders pattern fill when pattern prop is provided', () => {
    const { container } = render(AreaChart, {
      data: multiSeries, x: 'month', y: 'val', fill: 'category', pattern: 'category'
    })
    const paths = container.querySelectorAll('[data-plot-element="area"]')
    // Two-path rendering: one fill path + one pattern overlay per series (2 series = 4 total)
    expect(paths.length).toBe(4)
    // Pattern overlay paths use url(#...) fill
    const fills = [...paths].map((p) => p.getAttribute('fill'))
    expect(fills.some((f) => f?.startsWith('url(#'))).toBe(true)
  })

  it('stat=mean aggregates y values (renders without NaN path)', () => {
    const aggData = [
      { month: 1, val: 10 }, { month: 1, val: 20 },
      { month: 2, val: 30 }
    ]
    const { container } = render(AreaChart, { data: aggData, x: 'month', y: 'val', stat: 'mean' })
    const paths = container.querySelectorAll('[data-plot-element="area"]')
    expect(paths.length).toBeGreaterThanOrEqual(1)
    for (const path of paths) {
      expect(path.getAttribute('d')).not.toContain('NaN')
    }
  })
})
