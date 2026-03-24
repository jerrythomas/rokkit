import { describe, it, expect } from 'vitest'
import { splitByField, getFacetDomains } from '../../../src/lib/plot/facet.js'
import mpg from '../../fixtures/mpg.json'

describe('splitByField', () => {
  it('splits data into one group per distinct field value', () => {
    const panels = splitByField(mpg, 'drv')
    const drvValues = [...new Set(mpg.map((d) => d.drv))]
    expect(panels.size).toBe(drvValues.length)
    for (const val of drvValues) {
      expect(panels.has(val)).toBe(true)
    }
  })

  it('each panel contains only rows matching its facet value', () => {
    const panels = splitByField(mpg, 'drv')
    for (const [key, rows] of panels.entries()) {
      expect(rows.every((r) => r.drv === key)).toBe(true)
    }
  })

  it('all rows are accounted for across panels', () => {
    const panels = splitByField(mpg, 'drv')
    const total = [...panels.values()].reduce((sum, rows) => sum + rows.length, 0)
    expect(total).toBe(mpg.length)
  })

  it('returns panels in insertion (data) order of first occurrence', () => {
    const data = [
      { region: 'b', v: 1 },
      { region: 'a', v: 2 },
      { region: 'b', v: 3 }
    ]
    const panels = splitByField(data, 'region')
    const keys = [...panels.keys()]
    expect(keys[0]).toBe('b')
    expect(keys[1]).toBe('a')
  })
})

describe('getFacetDomains', () => {
  it('fixed mode: returns the same x/y domain for all panels', () => {
    const panels = splitByField(mpg, 'drv')
    const domains = getFacetDomains(panels, { x: 'displ', y: 'hwy' }, 'fixed')
    const domainValues = [...domains.values()]
    // All panels share the same x domain (full data range)
    const xDomains = domainValues.map((d) => d.xDomain)
    expect(xDomains.every((d) => JSON.stringify(d) === JSON.stringify(xDomains[0]))).toBe(true)
  })

  it('free mode: each panel has its own domain derived from its data', () => {
    const panels = splitByField(mpg, 'drv')
    const domains = getFacetDomains(panels, { x: 'displ', y: 'hwy' }, 'free')
    const domainValues = [...domains.values()]
    // Panels with different data ranges should have different domains
    // (may not always differ, but structure must be per-panel)
    expect(domainValues).toHaveLength(panels.size)
    for (const d of domainValues) {
      expect(d).toHaveProperty('xDomain')
      expect(d).toHaveProperty('yDomain')
    }
  })

  it('fixed mode: x domain spans all panels combined', () => {
    const panels = splitByField(mpg, 'drv')
    const domains = getFacetDomains(panels, { x: 'displ', y: 'hwy' }, 'fixed')
    const globalXMax = Math.max(...mpg.map((d) => d.displ))
    const globalXMin = Math.min(...mpg.map((d) => d.displ))
    const anyDomain = [...domains.values()][0].xDomain
    // x domain for a numeric field: [min, max] across all rows
    expect(anyDomain[1]).toBeCloseTo(globalXMax, 5)
    expect(anyDomain[0]).toBeCloseTo(globalXMin, 5)
  })

  it('categorical x field: fixed domain is union of all categories', () => {
    const panels = splitByField(mpg, 'drv')
    const domains = getFacetDomains(panels, { x: 'class', y: 'hwy' }, 'fixed')
    const allClasses = [...new Set(mpg.map((d) => d.class))]
    const anyXDomain = [...domains.values()][0].xDomain
    expect(anyXDomain).toEqual(expect.arrayContaining(allClasses))
  })
})
