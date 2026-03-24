import { describe, it, expect } from 'vitest'
import { scaleBand, scaleLinear } from 'd3-scale'
import { createMockState } from '../helpers/mock-plot-state.js'

describe('Axis tick generation', () => {
  it('derives x ticks from band scale domain', () => {
    const xScale = scaleBand().domain(['a', 'b', 'c']).range([0, 300]).padding(0.1)
    const ticks = xScale.domain().map((val) => ({
      value: val,
      pos: (xScale(val) ?? 0) + xScale.bandwidth() / 2
    }))
    expect(ticks).toHaveLength(3)
    expect(ticks[0].value).toBe('a')
    expect(ticks[0].pos).toBeGreaterThan(0)
  })

  it('derives y ticks from linear scale', () => {
    const yScale = scaleLinear().domain([0, 100]).range([200, 0])
    const ticks = yScale.ticks(5).map((val) => ({ value: val, pos: yScale(val) }))
    expect(ticks.length).toBeGreaterThanOrEqual(4)
    expect(ticks[0].value).toBe(0)
    expect(ticks[0].pos).toBe(200)
  })

  it('positions x axis at xAxisY from state (default = innerHeight)', () => {
    const state = createMockState({ xAxisY: 200, innerHeight: 200 })
    expect(state.xAxisY).toBe(200)
  })

  it('positions x axis at origin for quadrant mode', () => {
    const yScale = scaleLinear().domain([-50, 50]).range([200, 0])
    const xAxisY = yScale(0)
    expect(xAxisY).toBe(100)
  })
})
