import { describe, it, expect } from 'vitest'
import { PATTERN_ORDER, assignPatterns } from '../../src/lib/brewing/patterns.js'

describe('PATTERN_ORDER', () => {
  it('starts with Dots', () => {
    expect(PATTERN_ORDER[0]).toBe('Dots')
  })

  it('has exactly 9 patterns', () => {
    expect(PATTERN_ORDER).toHaveLength(9)
  })
})

describe('assignPatterns', () => {
  it('assigns patterns in order', () => {
    const values = ['a', 'b', 'c']
    const result = assignPatterns(values)
    expect(result.get('a')).toBe(PATTERN_ORDER[0])
    expect(result.get('b')).toBe(PATTERN_ORDER[1])
    expect(result.get('c')).toBe(PATTERN_ORDER[2])
  })

  it('cycles past the end of PATTERN_ORDER', () => {
    const values = Array.from({ length: PATTERN_ORDER.length + 1 }, (_, i) => `v${i}`)
    const result = assignPatterns(values)
    expect(result.get(`v${PATTERN_ORDER.length}`)).toBe(PATTERN_ORDER[0])
  })

  it('returns a Map', () => {
    const result = assignPatterns(['x', 'y'])
    expect(result).toBeInstanceOf(Map)
  })
})
