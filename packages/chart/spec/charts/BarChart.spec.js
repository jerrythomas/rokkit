import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import BarChart from '../../src/charts/BarChart.svelte'

const catData = [
  { category: 'A', revenue: 100 },
  { category: 'B', revenue: 200 },
  { category: 'C', revenue: 150 }
]

// Numeric X — year should be treated as discrete bands, not continuous range
const yearData = [
  { year: 1999, hwy: 29 },
  { year: 1999, hwy: 24 },
  { year: 2008, hwy: 31 },
  { year: 2008, hwy: 26 }
]

// Stacked bars with identity stat
const stackData = [
  { class: 'compact', drv: 'f', hwy: 29 },
  { class: 'compact', drv: '4', hwy: 26 },
  { class: 'suv',     drv: 'f', hwy: 20 },
  { class: 'suv',     drv: '4', hwy: 18 }
]

describe('BarChart — basic vertical', () => {
  it('renders without errors', () => {
    const { container } = render(BarChart, { data: catData, x: 'category', y: 'revenue' })
    expect(container).toBeTruthy()
  })

  it('renders an SVG element', () => {
    const { container } = render(BarChart, { data: catData, x: 'category', y: 'revenue' })
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('renders bar rect elements (one per datum)', () => {
    const { container } = render(BarChart, { data: catData, x: 'category', y: 'revenue' })
    const bars = container.querySelectorAll('[data-plot-element="bar"]')
    expect(bars.length).toBe(3)
  })

  it('bars have non-NaN height and y attributes', () => {
    const { container } = render(BarChart, { data: catData, x: 'category', y: 'revenue' })
    const bars = container.querySelectorAll('[data-plot-element="bar"]')
    for (const bar of bars) {
      expect(isNaN(parseFloat(bar.getAttribute('height')))).toBe(false)
      expect(isNaN(parseFloat(bar.getAttribute('y')))).toBe(false)
    }
  })

  it('renders with stat=sum without errors', () => {
    const aggData = [
      { category: 'A', revenue: 50 },
      { category: 'A', revenue: 50 },
      { category: 'B', revenue: 200 }
    ]
    const { container } = render(BarChart, { data: aggData, x: 'category', y: 'revenue', stat: 'sum' })
    const bars = container.querySelectorAll('[data-plot-element="bar"]')
    expect(bars.length).toBe(2)
  })
})

describe('BarChart — numeric X (year as discrete bands)', () => {
  it('renders without crashing when X is numeric years', () => {
    expect(() => render(BarChart, { data: yearData, x: 'year', y: 'hwy', stat: 'mean' })).not.toThrow()
  })

  it('renders one bar per distinct year value', () => {
    const { container } = render(BarChart, { data: yearData, x: 'year', y: 'hwy', stat: 'mean' })
    const bars = container.querySelectorAll('[data-plot-element="bar"]')
    expect(bars.length).toBe(2)
  })

  it('bars have non-NaN x attribute (band scale produced valid pixel position)', () => {
    const { container } = render(BarChart, { data: yearData, x: 'year', y: 'hwy', stat: 'mean' })
    const bars = container.querySelectorAll('[data-plot-element="bar"]')
    for (const bar of bars) {
      expect(isNaN(parseFloat(bar.getAttribute('x')))).toBe(false)
    }
  })
})

describe('BarChart — stacked with stat=identity', () => {
  it('renders stacked bars without overflow (bars fit inside SVG)', () => {
    const { container } = render(BarChart, {
      data: stackData, x: 'class', y: 'hwy', fill: 'drv', stack: true,
      width: 600, height: 400
    })
    const bars = container.querySelectorAll('[data-plot-element="bar"]')
    expect(bars.length).toBe(4)
    const svgHeight = parseFloat(container.querySelector('svg').getAttribute('height'))
    for (const bar of bars) {
      const y = parseFloat(bar.getAttribute('y'))
      const h = parseFloat(bar.getAttribute('height'))
      // bar must not start above 0 or end below svgHeight
      expect(y).toBeGreaterThanOrEqual(0)
      expect(y + h).toBeLessThanOrEqual(svgHeight + 1)
    }
  })
})

describe('BarChart — grouped with color', () => {
  it('renders one bar per (x, color) combination', () => {
    const { container } = render(BarChart, { data: stackData, x: 'class', y: 'hwy', fill: 'drv' })
    const bars = container.querySelectorAll('[data-plot-element="bar"]')
    expect(bars.length).toBe(4)
  })
})
