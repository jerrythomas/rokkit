import { describe, it, expect } from 'vitest'
import { scaleBand, scaleLinear } from 'd3-scale'
import { buildBoxes } from '../../../src/lib/brewing/marks/boxes.js'

// Pre-aggregated quartile rows (output of applyBoxStat)
const dataSimple = [
  { class: 'compact', q1: 20, median: 25, q3: 30, iqr_min: 13, iqr_max: 42 },
  { class: 'suv',     q1: 15, median: 18, q3: 22, iqr_min: 10, iqr_max: 30 }
]

const dataGrouped = [
  { class: 'compact', drv: 'f', q1: 22, median: 27, q3: 32, iqr_min: 15, iqr_max: 45 },
  { class: 'compact', drv: '4', q1: 18, median: 23, q3: 28, iqr_min: 11, iqr_max: 39 },
  { class: 'suv',     drv: '4', q1: 15, median: 18, q3: 22, iqr_min: 10, iqr_max: 30 }
]

const xScale = scaleBand().domain(['compact', 'suv']).range([0, 300]).padding(0.2)
const yScale = scaleLinear().domain([0, 50]).range([300, 0])
const colors = new Map([
  ['compact', { fill: '#4e79a7', stroke: '#4e79a7' }],
  ['suv',     { fill: '#f28e2b', stroke: '#f28e2b' }],
  ['f',       { fill: '#59a14f', stroke: '#59a14f' }],
  ['4',       { fill: '#e15759', stroke: '#e15759' }]
])

describe('buildBoxes — non-grouped (fill === x)', () => {
  const boxes = buildBoxes(dataSimple, { x: 'class', fill: 'class' }, xScale, yScale, colors)

  it('returns one box per datum', () => {
    expect(boxes).toHaveLength(2)
  })

  it('maps fill color from colors map by fill key', () => {
    const compact = boxes.find((b) => b.data.class === 'compact')
    expect(compact?.fill).toBe('#4e79a7')
  })

  it('cx is centered in the x-band', () => {
    const bw = xScale.bandwidth()
    for (const box of boxes) {
      const bandStart = xScale(box.data.class) ?? 0
      expect(box.cx).toBeCloseTo(bandStart + bw / 2, 1)
    }
  })

  it('q1, median, q3 are scaled y values (no NaN)', () => {
    for (const box of boxes) {
      expect(isNaN(box.q1)).toBe(false)
      expect(isNaN(box.median)).toBe(false)
      expect(isNaN(box.q3)).toBe(false)
      expect(isNaN(box.iqr_min)).toBe(false)
      expect(isNaN(box.iqr_max)).toBe(false)
    }
  })

  it('width and whiskerWidth are positive', () => {
    for (const box of boxes) {
      expect(box.width).toBeGreaterThan(0)
      expect(box.whiskerWidth).toBeGreaterThan(0)
    }
  })

  it('returns stroke from the colors map (darker shade)', () => {
    const compact = boxes.find((b) => b.data.class === 'compact')
    expect(compact?.stroke).toBe('#4e79a7')
  })

  it('falls back to #aaa fill when fill key not in colors map', () => {
    const emptyColors = new Map()
    const result = buildBoxes(dataSimple, { x: 'class', fill: 'class' }, xScale, yScale, emptyColors)
    expect(result[0].fill).toBe('#aaa')
  })
})

describe('buildBoxes — grouped (fill !== x)', () => {
  const boxes = buildBoxes(dataGrouped, { x: 'class', fill: 'drv' }, xScale, yScale, colors)

  it('returns one box per datum', () => {
    expect(boxes).toHaveLength(3)
  })

  it('fill color is keyed by fill field (drv), not x field (class)', () => {
    const fBox = boxes.find((b) => b.data.drv === 'f')
    const fourBox = boxes.find((b) => b.data.drv === '4' && b.data.class === 'compact')
    expect(fBox?.fill).toBe('#59a14f')
    expect(fourBox?.fill).toBe('#e15759')
  })

  it('sub-boxes for same x are positioned side by side (different cx)', () => {
    const compactBoxes = boxes.filter((b) => b.data.class === 'compact')
    expect(compactBoxes).toHaveLength(2)
    expect(compactBoxes[0].cx).not.toBe(compactBoxes[1].cx)
  })

  it('sub-box cx values are within the parent x-band', () => {
    const bw = xScale.bandwidth()
    for (const box of boxes) {
      const bandStart = xScale(box.data.class) ?? 0
      expect(box.cx).toBeGreaterThanOrEqual(bandStart)
      expect(box.cx).toBeLessThanOrEqual(bandStart + bw)
    }
  })

  it('grouped boxes are narrower than non-grouped', () => {
    const grouped = buildBoxes(dataGrouped, { x: 'class', fill: 'drv' }, xScale, yScale, colors)
    const single = buildBoxes(dataSimple, { x: 'class', fill: 'class' }, xScale, yScale, colors)
    expect(grouped[0].width).toBeLessThan(single[0].width)
  })
})
