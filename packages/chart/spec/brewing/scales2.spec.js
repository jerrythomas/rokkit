import { describe, it, expect } from 'vitest'
import { buildXScale, buildYScale, buildSizeScale } from '../../src/lib/brewing/scales.js'

const categoricalData = [
  { date: 'Jan', revenue: 100 },
  { date: 'Feb', revenue: 200 },
  { date: 'Mar', revenue: 150 }
]

describe('buildXScale', () => {
  it('returns a band scale for categorical x values', () => {
    const scale = buildXScale(categoricalData, 'date', 400)
    expect(typeof scale).toBe('function')
    expect(typeof scale.bandwidth).toBe('function')
    expect(scale.domain()).toEqual(['Jan', 'Feb', 'Mar'])
  })

  it('returns a linear scale for numeric x values', () => {
    const numData = [{ x: 1, y: 10 }, { x: 5, y: 20 }, { x: 10, y: 30 }]
    const scale = buildXScale(numData, 'x', 400)
    expect(typeof scale).toBe('function')
    expect(scale.domain()[0]).toBeLessThanOrEqual(1)
    expect(scale.domain()[1]).toBeGreaterThanOrEqual(10)
  })
})

describe('buildYScale', () => {
  it('returns a linear scale from 0 to max y value', () => {
    const scale = buildYScale(categoricalData, 'revenue', 300)
    expect(typeof scale).toBe('function')
    expect(scale.domain()[0]).toBe(0)
    expect(scale.domain()[1]).toBeGreaterThanOrEqual(200)
  })

  it('extends y domain when additional layer data has larger values', () => {
    const layerData = [{ revenue: 300 }]
    const scale = buildYScale(categoricalData, 'revenue', 300, [{ data: layerData, y: 'revenue' }])
    expect(scale.domain()[1]).toBeGreaterThanOrEqual(300)
  })

  it('maps height to 0 at max value (SVG y-axis inverted)', () => {
    const scale = buildYScale(categoricalData, 'revenue', 300)
    // range should be [height, 0] i.e. 300 at bottom, 0 at top
    expect(scale.range()[0]).toBe(300)
    expect(scale.range()[1]).toBe(0)
  })
})

describe('buildSizeScale', () => {
  it('returns a sqrt scale', () => {
    const data = [{ size: 100 }, { size: 400 }]
    const scale = buildSizeScale(data, 'size')
    expect(typeof scale).toBe('function')
    expect(scale(0)).toBe(0)
    expect(scale(400)).toBeGreaterThan(0)
  })
})
