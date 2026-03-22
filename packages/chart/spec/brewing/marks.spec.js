import { describe, it, expect } from 'vitest'
import { buildBars } from '../../src/lib/brewing/marks/bars.js'
import { buildPoints } from '../../src/lib/brewing/marks/points.js'
import { buildArcs } from '../../src/lib/brewing/marks/arcs.js'
import { scaleBand, scaleLinear } from 'd3-scale'

const xScale = scaleBand().domain(['A', 'B']).range([0, 200]).padding(0.1)
const yScale = scaleLinear().domain([0, 100]).range([200, 0])
const colors = new Map([['A', { fill: 'red', stroke: 'darkred' }], ['B', { fill: 'blue', stroke: 'darkblue' }]])

describe('buildBars', () => {
  const data = [{ cat: 'A', val: 50 }, { cat: 'B', val: 80 }]

  it('returns one bar per data point', () => {
    const bars = buildBars(data, { x: 'cat', y: 'val' }, xScale, yScale, colors)
    expect(bars).toHaveLength(2)
  })

  it('bar has x, y, width, height, fill, stroke', () => {
    const [bar] = buildBars(data, { x: 'cat', y: 'val' }, xScale, yScale, colors)
    expect(bar).toHaveProperty('x')
    expect(bar).toHaveProperty('y')
    expect(bar).toHaveProperty('width')
    expect(bar).toHaveProperty('height')
    expect(bar).toHaveProperty('fill')
    expect(bar).toHaveProperty('stroke')
  })
})

describe('buildPoints', () => {
  const xScaleLinear = scaleLinear().domain([0, 10]).range([0, 200])
  const data = [{ x: 1, y: 50 }, { x: 5, y: 80 }]

  it('returns one point per data point', () => {
    const pts = buildPoints(data, { x: 'x', y: 'y' }, xScaleLinear, yScale, colors, null)
    expect(pts).toHaveLength(2)
  })

  it('point has cx, cy, r', () => {
    const [pt] = buildPoints(data, { x: 'x', y: 'y' }, xScaleLinear, yScale, colors, null)
    expect(pt).toHaveProperty('cx')
    expect(pt).toHaveProperty('cy')
    expect(pt).toHaveProperty('r')
  })
})

describe('buildArcs', () => {
  const data = [{ label: 'A', value: 30 }, { label: 'B', value: 70 }]

  it('returns one arc per data point', () => {
    const arcs = buildArcs(data, { label: 'label', y: 'value' }, colors, 100, 100)
    expect(arcs).toHaveLength(2)
  })

  it('arc has d (path), fill, stroke', () => {
    const [arc] = buildArcs(data, { label: 'label', y: 'value' }, colors, 100, 100)
    expect(arc).toHaveProperty('d')
    expect(arc).toHaveProperty('fill')
    expect(arc).toHaveProperty('stroke')
  })
})
