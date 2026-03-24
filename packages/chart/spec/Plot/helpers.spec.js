import { describe, it, expect } from 'vitest'
import { resolveFormat, resolveTooltip, resolveGeom } from '../../src/lib/plot/helpers.js'

describe('resolveFormat', () => {
  it('returns identity formatter when no format defined', () => {
    const fmt = resolveFormat('revenue', {})
    expect(fmt(1234)).toBe('1234')
  })

  it('returns field formatter from helpers.format', () => {
    const helpers = { format: { revenue: (v) => `$${v}` } }
    const fmt = resolveFormat('revenue', helpers)
    expect(fmt(100)).toBe('$100')
  })

  it('returns identity when field not in helpers.format', () => {
    const helpers = { format: { other: (v) => `x${v}` } }
    const fmt = resolveFormat('revenue', helpers)
    expect(fmt(42)).toBe('42')
  })
})

describe('resolveTooltip', () => {
  it('returns null when no tooltip helper defined', () => {
    expect(resolveTooltip({})).toBeNull()
  })

  it('returns tooltip function from helpers', () => {
    const fn = (d) => `${d.name}: ${d.value}`
    const helpers = { tooltip: fn }
    expect(resolveTooltip(helpers)).toBe(fn)
  })
})

describe('resolveGeom', () => {
  it('returns null for unknown geom type with no helpers', () => {
    expect(resolveGeom('hexbin', {})).toBeNull()
  })

  it('returns component from helpers.geoms', () => {
    const FakeComponent = {}
    const helpers = { geoms: { hexbin: FakeComponent } }
    expect(resolveGeom('hexbin', helpers)).toBe(FakeComponent)
  })

  it('returns null for built-in geom names (handled by Plot, not helpers)', () => {
    expect(resolveGeom('bar', {})).toBeNull()
  })
})
