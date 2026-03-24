import { describe, it, expect, beforeEach } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { flushSync } from 'svelte'
import { scaleBand, scaleLinear } from 'd3-scale'
import TestBarCF from '../helpers/TestBarCF.svelte'
import { createMockState } from '../helpers/mock-plot-state.js'
import { testCf, resetTestCf } from '../helpers/testCf.svelte.js'

const barData = [
  { category: 'A', value: 10 },
  { category: 'B', value: 20 },
  { category: 'C', value: 30 }
]

function createBarState(overrides = {}) {
  const xScale = scaleBand().domain(['A', 'B', 'C']).range([0, 300]).padding(0.1)
  const yScale = scaleLinear().domain([0, 40]).range([200, 0])
  return createMockState({
    xScale,
    yScale,
    geomData: () => barData,
    colors: new Map([
      ['A', { fill: '#4e79a7', stroke: null }],
      ['B', { fill: '#f28e2b', stroke: null }],
      ['C', { fill: '#e15759', stroke: null }]
    ]),
    ...overrides
  })
}

describe('Bar geom — crossfilter (filterable)', () => {
  beforeEach(() => resetTestCf())

  it('renders bars without data-dimmed when no filter active', () => {
    const state = createBarState()
    const { container } = render(TestBarCF, { props: { state, filterable: true, crossfilter: testCf } })
    const bars = container.querySelectorAll('[data-plot-element="bar"]')
    expect(bars.length).toBe(3)
    bars.forEach(bar => {
      expect(bar.hasAttribute('data-dimmed')).toBe(false)
    })
  })

  it('applies data-dimmed attribute to out-of-filter bars after bar click', async () => {
    const state = createBarState()
    const { container } = render(TestBarCF, { props: { state, filterable: true, crossfilter: testCf } })
    const bars = container.querySelectorAll('[data-plot-element="bar"]')
    expect(bars.length).toBe(3)

    // Click bar 'A' to filter it in — B and C should become dimmed
    await fireEvent.click(bars[0])
    flushSync()

    const updatedBars = container.querySelectorAll('[data-plot-element="bar"]')
    const dimmedBars = Array.from(updatedBars).filter(b => b.hasAttribute('data-dimmed'))
    expect(dimmedBars.length).toBe(2)
    // The filtered bar ('A') should NOT be dimmed
    expect(updatedBars[0].hasAttribute('data-dimmed')).toBe(false)
  })

  it('bars have pointer cursor when filterable is true', () => {
    const state = createBarState()
    const { container } = render(TestBarCF, { props: { state, filterable: true, crossfilter: testCf } })
    const bars = container.querySelectorAll('[data-plot-element="bar"]')
    expect(bars.length).toBe(3)
    bars.forEach(bar => {
      expect(bar.style.cursor).toBe('pointer')
    })
  })

  it('bars have no pointer cursor when filterable is false', () => {
    const state = createBarState()
    const { container } = render(TestBarCF, { props: { state, filterable: false, crossfilter: testCf } })
    const bars = container.querySelectorAll('[data-plot-element="bar"]')
    expect(bars.length).toBe(3)
    bars.forEach(bar => {
      expect(bar.style.cursor).toBe('')
    })
  })
})
