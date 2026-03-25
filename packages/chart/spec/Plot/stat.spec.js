import { describe, it, expect, vi } from 'vitest'
import mpg from '../fixtures/mpg.json'
import { resolveStat, inferGroupByFields, applyGeomStat } from '../../src/lib/plot/stat.js'

describe('resolveStat', () => {
  it('returns identity function for "identity"', () => {
    const fn = resolveStat('identity', {})
    const data = [1, 2, 3]
    expect(fn(data)).toBe(data)
  })

  it('returns built-in sum function', () => {
    const fn = resolveStat('sum', {})
    expect(fn([10, 20, 30])).toBe(60)
  })

  it('returns built-in mean function', () => {
    const fn = resolveStat('mean', {})
    expect(fn([10, 20, 30])).toBe(20)
  })

  it('returns built-in count function', () => {
    const fn = resolveStat('count', {})
    expect(fn([1, 2, 3])).toBe(3)
  })

  it('returns built-in median function', () => {
    const fn = resolveStat('median', {})
    expect(fn([1, 3, 2])).toBe(2)
  })

  it('returns built-in min function', () => {
    const fn = resolveStat('min', {})
    expect(fn([5, 1, 9])).toBe(1)
  })

  it('returns built-in max function', () => {
    const fn = resolveStat('max', {})
    expect(fn([5, 1, 9])).toBe(9)
  })

  it('resolves custom stat from helpers.stats', () => {
    const custom = (vals) => vals.reduce((a, b) => a + b, 0) * 2
    const fn = resolveStat('double_sum', { stats: { double_sum: custom } })
    expect(fn([5, 5])).toBe(20)
  })

  it('warns and returns identity for unknown stat', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const fn = resolveStat('nonexistent', {})
    const data = [1, 2, 3]
    expect(fn(data)).toBe(data)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('nonexistent'))
    warn.mockRestore()
  })
})

describe('inferGroupByFields', () => {
  it('returns all non-value channel fields', () => {
    const channels = { x: 'class', y: 'cty', color: 'drv' }
    const valueFields = ['cty']
    expect(inferGroupByFields(channels, valueFields)).toEqual(['class', 'drv'])
  })

  it('excludes undefined channels', () => {
    const channels = { x: 'class', y: 'cty', color: undefined }
    expect(inferGroupByFields(channels, ['cty'])).toEqual(['class'])
  })

  it('deduplicates fields', () => {
    const channels = { x: 'class', color: 'class', y: 'cty' }
    expect(inferGroupByFields(channels, ['cty'])).toEqual(['class'])
  })
})

describe('applyGeomStat', () => {
  it('identity returns data unchanged', () => {
    const result = applyGeomStat(mpg, { stat: 'identity', channels: { x: 'class', y: 'cty' } }, {})
    expect(result).toBe(mpg)
  })

  it('sum aggregates cty by class from mpg', () => {
    const result = applyGeomStat(mpg, { stat: 'sum', channels: { x: 'class', y: 'cty' } }, {})
    const compact = result.find((r) => r.class === 'compact')
    const expected = mpg.filter((r) => r.class === 'compact').reduce((a, r) => a + r.cty, 0)
    expect(compact.cty).toBe(expected)
  })

  it('mean aggregates hwy by class from mpg', () => {
    const result = applyGeomStat(mpg, { stat: 'mean', channels: { x: 'class', y: 'hwy' } }, {})
    const suv = result.find((r) => r.class === 'suv')
    const suvRows = mpg.filter((r) => r.class === 'suv')
    const expected = suvRows.reduce((a, r) => a + r.hwy, 0) / suvRows.length
    expect(suv.hwy).toBeCloseTo(expected)
  })

  it('groups by multiple channels (class + drv)', () => {
    const result = applyGeomStat(
      mpg,
      { stat: 'count', channels: { x: 'class', color: 'drv', y: 'cty' } },
      {}
    )
    const compactF = result.filter((r) => r.class === 'compact' && r.drv === 'f')
    const compactFour = result.filter((r) => r.class === 'compact' && r.drv === '4')
    expect(compactF.length).toBeGreaterThan(0)
    expect(compactFour.length).toBeGreaterThan(0)
  })

  it('boxplot stat produces quartile rows', () => {
    const vals = [
      { class: 'A', hwy: 10 }, { class: 'A', hwy: 20 },
      { class: 'A', hwy: 30 }, { class: 'A', hwy: 40 }
    ]
    const result = applyGeomStat(vals, { stat: 'boxplot', channels: { x: 'class', y: 'hwy' } }, {})
    expect(result).toHaveLength(1)
    const [row] = result
    expect(row).toHaveProperty('q1')
    expect(row).toHaveProperty('median')
    expect(row).toHaveProperty('q3')
    expect(row).toHaveProperty('iqr_min')
    expect(row).toHaveProperty('iqr_max')
  })

  it('boxplot groups by x + color channel', () => {
    const vals = [
      { class: 'A', drv: 'f', hwy: 10 }, { class: 'A', drv: 'f', hwy: 20 },
      { class: 'A', drv: '4', hwy: 30 }, { class: 'A', drv: '4', hwy: 40 }
    ]
    const result = applyGeomStat(
      vals,
      { stat: 'boxplot', channels: { x: 'class', y: 'hwy', color: 'drv' } },
      {}
    )
    expect(result).toHaveLength(2)
  })

  it('uses custom stat from helpers', () => {
    const helpers = { stats: { p95: (vals) => vals.sort((a, b) => a - b)[Math.floor(vals.length * 0.95)] } }
    const result = applyGeomStat(mpg, { stat: 'p95', channels: { x: 'class', y: 'cty' } }, helpers)
    expect(result.length).toBeGreaterThan(0)
    expect(result[0]).toHaveProperty('class')
    expect(result[0]).toHaveProperty('cty')
  })

  it('aggregates multiple value channels (y + size)', () => {
    const result = applyGeomStat(
      mpg,
      { stat: 'sum', channels: { x: 'class', y: 'cty', size: 'hwy' } },
      {}
    )
    const compact = result.find((r) => r.class === 'compact')
    expect(compact).toHaveProperty('cty')
    expect(compact).toHaveProperty('hwy')
    const expectedCty = mpg.filter((r) => r.class === 'compact').reduce((a, r) => a + r.cty, 0)
    const expectedHwy = mpg.filter((r) => r.class === 'compact').reduce((a, r) => a + r.hwy, 0)
    expect(compact.cty).toBe(expectedCty)
    expect(compact.hwy).toBe(expectedHwy)
  })
})
