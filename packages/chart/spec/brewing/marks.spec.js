import { describe, it, expect } from 'vitest'
import { buildBars } from '../../src/lib/brewing/marks/bars.js'
import { buildPoints, assignSymbols, buildSymbolPath } from '../../src/lib/brewing/marks/points.js'
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

  it('symbolPath is null when no symbol channel', () => {
    const [pt] = buildPoints(data, { x: 'x', y: 'y' }, xScaleLinear, yScale, colors, null)
    expect(pt.symbolPath).toBeNull()
  })

  it('symbolPath is a non-empty SVG path string when symbol channel is set', () => {
    const symbolData = [{ x: 1, y: 50, shape: 'A' }, { x: 5, y: 80, shape: 'B' }]
    const symbolMap = assignSymbols(['A', 'B'])
    const pts = buildPoints(symbolData, { x: 'x', y: 'y', symbol: 'shape' }, xScaleLinear, yScale, colors, null, symbolMap)
    for (const pt of pts) {
      expect(typeof pt.symbolPath).toBe('string')
      expect(pt.symbolPath.length).toBeGreaterThan(0)
      expect(pt.symbolPath).toMatch(/M/)
    }
  })
})

describe('assignSymbols', () => {
  it('returns a Map mapping each value to a shape name', () => {
    const map = assignSymbols(['A', 'B', 'C'])
    expect(map.get('A')).toBe('circle')
    expect(map.get('B')).toBe('square')
    expect(map.get('C')).toBe('triangle')
  })

  it('cycles through shapes for more values than shapes', () => {
    const vals = ['a', 'b', 'c', 'd', 'e', 'f', 'g']
    const map = assignSymbols(vals)
    expect(map.get('a')).toBe('circle')
    expect(map.get('g')).toBe('circle')   // cycles back
  })
})

describe('buildSymbolPath', () => {
  it('returns a non-empty path string for circle', () => {
    const d = buildSymbolPath('circle', 5)
    expect(typeof d).toBe('string')
    expect(d.length).toBeGreaterThan(0)
    expect(d).not.toContain('NaN')
  })

  it('returns a path string for all known shapes', () => {
    for (const shape of ['circle', 'square', 'triangle', 'diamond', 'cross', 'star']) {
      const d = buildSymbolPath(shape, 4)
      expect(typeof d).toBe('string')
      expect(d.length).toBeGreaterThan(0)
    }
  })

  it('falls back to circle for unknown shape name', () => {
    const circle = buildSymbolPath('circle', 5)
    const unknown = buildSymbolPath('unknown', 5)
    expect(circle).toBe(unknown)
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
