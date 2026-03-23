import { describe, it, expect } from 'vitest'
import { STAT_FNS, applyAggregate } from '../../src/lib/brewing/stats.js'

const data = [
  { cat: 'A', val: 10, group: 'x' },
  { cat: 'A', val: 20, group: 'x' },
  { cat: 'B', val: 30, group: 'y' },
  { cat: 'B', val: 40, group: 'y' }
]

describe('STAT_FNS', () => {
  it('sum adds values', () => expect(STAT_FNS.sum([1, 2, 3])).toBe(6))
  it('mean averages values', () => expect(STAT_FNS.mean([10, 20, 30])).toBe(20))
  it('min returns smallest', () => expect(STAT_FNS.min([5, 1, 9])).toBe(1))
  it('max returns largest', () => expect(STAT_FNS.max([5, 1, 9])).toBe(9))
  it('count returns length', () => expect(STAT_FNS.count([1, 2, 3])).toBe(3))
})

describe('applyAggregate', () => {
  it('identity returns data unchanged', () => {
    const result = applyAggregate(data, { by: ['cat'], value: 'val', stat: 'identity' })
    expect(result).toBe(data)
  })

  it('sum groups and sums', () => {
    const result = applyAggregate(data, { by: ['cat'], value: 'val', stat: 'sum' })
    expect(result).toHaveLength(2)
    const a = result.find((r) => r.cat === 'A')
    expect(a.val).toBe(30)
  })

  it('mean groups and averages', () => {
    const result = applyAggregate(data, { by: ['cat'], value: 'val', stat: 'mean' })
    const a = result.find((r) => r.cat === 'A')
    expect(a.val).toBe(15)
  })

  it('count groups and counts rows', () => {
    const result = applyAggregate(data, { by: ['cat'], value: 'val', stat: 'count' })
    const a = result.find((r) => r.cat === 'A')
    expect(a.val).toBe(2)
  })

  it('accepts a custom function', () => {
    const customFn = (values) => values.reduce((a, b) => a + b, 0) * 2
    const result = applyAggregate(data, { by: ['cat'], value: 'val', stat: customFn })
    const a = result.find((r) => r.cat === 'A')
    expect(a.val).toBe(60)
  })

  it('groups by multiple fields', () => {
    const result = applyAggregate(data, { by: ['cat', 'group'], value: 'val', stat: 'sum' })
    expect(result).toHaveLength(2)
  })

  it('returns data unchanged when by is empty', () => {
    const result = applyAggregate(data, { by: [], value: 'val', stat: 'sum' })
    expect(result).toBe(data)
  })
})
