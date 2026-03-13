import { describe, it, expect } from 'vitest'
import { evaluateCondition } from './conditions.js'

describe('evaluateCondition', () => {
  it('returns true when condition is null', () => {
    expect(evaluateCondition(null, { accountType: 'personal' })).toBe(true)
  })

  it('returns true when condition is undefined', () => {
    expect(evaluateCondition(undefined, { accountType: 'personal' })).toBe(true)
  })

  it('returns true when neither operator is set', () => {
    expect(evaluateCondition({ field: 'accountType' }, { accountType: 'business' })).toBe(true)
  })

  describe('equals operator', () => {
    it('returns true when value matches', () => {
      expect(
        evaluateCondition({ field: 'accountType', equals: 'business' }, { accountType: 'business' })
      ).toBe(true)
    })

    it('returns false when value does not match', () => {
      expect(
        evaluateCondition({ field: 'accountType', equals: 'business' }, { accountType: 'personal' })
      ).toBe(false)
    })

    it('returns false when field is absent (undefined)', () => {
      expect(evaluateCondition({ field: 'accountType', equals: 'business' }, {})).toBe(false)
    })
  })

  describe('notEquals operator', () => {
    it('returns true when value does not match', () => {
      expect(
        evaluateCondition(
          { field: 'accountType', notEquals: 'business' },
          { accountType: 'personal' }
        )
      ).toBe(true)
    })

    it('returns false when value matches', () => {
      expect(
        evaluateCondition(
          { field: 'accountType', notEquals: 'business' },
          { accountType: 'business' }
        )
      ).toBe(false)
    })

    it('returns true when field is absent (undefined !== value)', () => {
      expect(evaluateCondition({ field: 'accountType', notEquals: 'business' }, {})).toBe(true)
    })
  })
})
