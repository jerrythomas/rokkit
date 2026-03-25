import { describe, it, expect } from 'vitest'
import mpg from '../fixtures/mpg.json'
import {
  inferFieldType,
  inferOrientation,
  buildUnifiedXScale,
  buildUnifiedYScale,
  inferColorScaleType,
} from '../../src/lib/plot/scales.js'

describe('inferFieldType', () => {
  it('returns "band" for string field (class)', () => {
    expect(inferFieldType(mpg, 'class')).toBe('band')
  })
  it('returns "continuous" for numeric field (cty)', () => {
    expect(inferFieldType(mpg, 'cty')).toBe('continuous')
  })
  it('returns "continuous" for year (numbers)', () => {
    expect(inferFieldType(mpg, 'year')).toBe('continuous')
  })
  it('returns "band" for drv (single-char strings)', () => {
    expect(inferFieldType(mpg, 'drv')).toBe('band')
  })
})

describe('inferOrientation', () => {
  it('returns "vertical" when x is band, y is continuous', () => {
    expect(inferOrientation('band', 'continuous')).toBe('vertical')
  })
  it('returns "horizontal" when y is band, x is continuous', () => {
    expect(inferOrientation('continuous', 'band')).toBe('horizontal')
  })
  it('returns "none" when both are continuous', () => {
    expect(inferOrientation('continuous', 'continuous')).toBe('none')
  })
  it('returns "none" when both are band (unusual but valid)', () => {
    expect(inferOrientation('band', 'band')).toBe('none')
  })
})

describe('buildUnifiedXScale', () => {
  it('builds band scale for categorical x field', () => {
    const scale = buildUnifiedXScale([mpg], 'class', 500)
    expect(typeof scale.bandwidth).toBe('function')
    expect(scale.domain()).toContain('compact')
    expect(scale.domain()).toContain('suv')
  })
  it('builds linear scale for numeric x field (displ)', () => {
    const scale = buildUnifiedXScale([mpg], 'displ', 500)
    expect(typeof scale.ticks).toBe('function')
  })
  it('unions domains across multiple datasets', () => {
    const ds1 = mpg.filter((r) => r.class === 'compact')
    const ds2 = mpg.filter((r) => r.class === 'suv')
    const unified = buildUnifiedXScale([ds1, ds2], 'class', 500)
    expect(unified.domain()).toContain('compact')
    expect(unified.domain()).toContain('suv')
  })
  it('respects explicit numeric domain override', () => {
    const scale = buildUnifiedXScale([mpg], 'cty', 500, { domain: [0, 50] })
    expect(scale.domain()).toEqual([0, 50])
    expect(typeof scale.ticks).toBe('function')
  })
  it('respects explicit categorical domain override (preserves band scale)', () => {
    const scale = buildUnifiedXScale([mpg], 'class', 500, { domain: ['suv', 'compact', 'midsize'] })
    expect(typeof scale.bandwidth).toBe('function')
    expect(scale.domain()).toEqual(['suv', 'compact', 'midsize'])
  })

  it('opts.band=true forces scaleBand for numeric x field (e.g. year on bar chart)', () => {
    const scale = buildUnifiedXScale([mpg], 'year', 500, { band: true })
    // Must be a band scale, not linear
    expect(typeof scale.bandwidth).toBe('function')
    // Domain must contain only the distinct data values, not a continuous range
    const domain = scale.domain()
    expect(domain).toContain(1999)
    expect(domain).toContain(2008)
    expect(domain).toHaveLength(2)   // only 1999 and 2008 exist in mpg
  })

  it('opts.band=true with explicit domain still produces band scale', () => {
    const scale = buildUnifiedXScale([mpg], 'year', 500, { band: true, domain: [1999, 2003, 2008] })
    expect(typeof scale.bandwidth).toBe('function')
    expect(scale.domain()).toEqual([1999, 2003, 2008])
  })
})

describe('buildUnifiedYScale', () => {
  it('builds scale from 0 to max cty when includeZero (bar chart default)', () => {
    const scale = buildUnifiedYScale([mpg], 'cty', 400, { includeZero: true })
    expect(scale.domain()[0]).toBe(0)
    expect(scale.domain()[1]).toBeGreaterThanOrEqual(28)
  })
  it('builds scale from min to max hwy when not includeZero (scatter/line)', () => {
    const scale = buildUnifiedYScale([mpg], 'hwy', 400, { includeZero: false })
    expect(scale.domain()[0]).toBeGreaterThan(0)
    expect(scale.domain()[0]).toBeLessThan(20)
    expect(scale.domain()[1]).toBeGreaterThanOrEqual(36)
  })
  it('unions y domain across multiple datasets', () => {
    const ds1 = mpg.filter((r) => r.cty < 20)
    const ds2 = mpg.filter((r) => r.cty >= 20)
    const scale = buildUnifiedYScale([ds1, ds2], 'cty', 400, { includeZero: true })
    expect(scale.domain()[1]).toBeGreaterThanOrEqual(28)
  })
  it('respects explicit domain override', () => {
    const scale = buildUnifiedYScale([mpg], 'cty', 400, { domain: [10, 40] })
    expect(scale.domain()).toEqual([10, 40])
  })
})

describe('inferFieldType + inferOrientation integration', () => {
  it('x=cty (numeric) + y=class (band) → horizontal', () => {
    const xType = inferFieldType(mpg, 'cty')
    const yType = inferFieldType(mpg, 'class')
    expect(inferOrientation(xType, yType)).toBe('horizontal')
  })
  it('x=class (band) + y=hwy (continuous) → vertical', () => {
    const xType = inferFieldType(mpg, 'class')
    const yType = inferFieldType(mpg, 'hwy')
    expect(inferOrientation(xType, yType)).toBe('vertical')
  })
  it('x=displ (continuous) + y=hwy (continuous) → none (scatter)', () => {
    const xType = inferFieldType(mpg, 'displ')
    const yType = inferFieldType(mpg, 'hwy')
    expect(inferOrientation(xType, yType)).toBe('none')
  })
})

describe('inferColorScaleType', () => {
  it('returns "categorical" for string color field', () => {
    expect(inferColorScaleType(mpg, 'class', {})).toBe('categorical')
  })
  it('returns "categorical" for string color field (drv)', () => {
    expect(inferColorScaleType(mpg, 'drv', {})).toBe('categorical')
  })
  it('returns "sequential" for numeric color field', () => {
    expect(inferColorScaleType(mpg, 'cty', {})).toBe('sequential')
  })
  it('returns "diverging" when colorMidpoint is set', () => {
    expect(inferColorScaleType(mpg, 'cty', { colorMidpoint: 20 })).toBe('diverging')
  })
  it('respects explicit colorScale override', () => {
    expect(inferColorScaleType(mpg, 'cty', { colorScale: 'categorical' })).toBe('categorical')
  })
})
