import { describe, it, expect } from 'vitest'
import { applyDimming } from '../../../src/lib/plot/crossfilter.js'

describe('applyDimming', () => {
  it('returns all rows wrapped as { data, dimmed } objects', () => {
    const data = [
      { x: 1, y: 2 },
      { x: 3, y: 4 },
    ]
    const cf = {
      isDimmed: () => false,
    }
    const channels = { x: 'x', y: 'y' }

    const result = applyDimming(data, cf, channels)

    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ data: { x: 1, y: 2 }, dimmed: false })
    expect(result[1]).toEqual({ data: { x: 3, y: 4 }, dimmed: false })
  })

  it('dimmed is false when no filter is active', () => {
    const data = [{ category: 'A', value: 10 }]
    const cf = {
      isDimmed: () => false,
    }
    const channels = { x: 'category', y: 'value' }

    const result = applyDimming(data, cf, channels)

    expect(result[0].dimmed).toBe(false)
  })

  it('dimmed is true when a field value is filtered out', () => {
    const data = [{ category: 'A', value: 10 }]
    const cf = {
      isDimmed: (field, value) => {
        // Simulate: 'category' field is filtered, 'A' is dimmed
        return field === 'category' && value === 'A'
      },
    }
    const channels = { x: 'category', y: 'value' }

    const result = applyDimming(data, cf, channels)

    expect(result[0].dimmed).toBe(true)
  })

  it('dimmed is true when a channel field value matches the filter', () => {
    const data = [{ category: 'A', value: 10 }]
    const cf = {
      isDimmed: (field, value) => {
        // 'value' field is filtered; value=10 matches (10 > 5)
        return field === 'value' && value > 5
      },
    }
    const channels = { x: 'category', y: 'value' }

    const result = applyDimming(data, cf, channels)

    expect(result[0].dimmed).toBe(true)  // value=10 > 5, so it is dimmed
  })

  it('dimmed is false when none of the row\'s channel fields match the filter', () => {
    const data = [{ category: 'A', value: 10 }]
    const cf = {
      isDimmed: (field, value) => {
        // Filter active: 'category' field, but only 'X' is dimmed (not 'A')
        return field === 'category' && value === 'X'
      },
    }
    const channels = { x: 'category', y: 'value' }

    const result = applyDimming(data, cf, channels)

    expect(result[0].dimmed).toBe(false)  // category='A' does not match filter for 'X'
  })

  it('null/undefined channel fields are ignored', () => {
    const data = [{ x: 1, y: 2 }]
    let callCount = 0
    const cf = {
      isDimmed: () => {
        callCount++
        return false
      },
    }
    const channels = { x: 'x', y: 'y', color: null, pattern: undefined }

    const result = applyDimming(data, cf, channels)

    // Should only call isDimmed for 'x' and 'y', not for null/undefined fields
    expect(callCount).toBe(2)
    expect(result[0].dimmed).toBe(false)
    expect(result).toHaveLength(1)
  })

  it('empty data array returns empty array', () => {
    const data = []
    const cf = {
      isDimmed: () => false,
    }
    const channels = { x: 'x', y: 'y' }

    const result = applyDimming(data, cf, channels)

    expect(result).toEqual([])
  })

  it('handles multiple channel fields, dimmed if ANY field is filtered', () => {
    const data = [
      { x: 1, y: 2, color: 'red' },
      { x: 3, y: 4, color: 'blue' },
    ]
    const cf = {
      isDimmed: (field, value) => {
        // Only 'color' field with 'red' is dimmed
        return field === 'color' && value === 'red'
      },
    }
    const channels = { x: 'x', y: 'y', color: 'color' }

    const result = applyDimming(data, cf, channels)

    expect(result[0].dimmed).toBe(true)   // color is 'red', which is dimmed
    expect(result[1].dimmed).toBe(false)  // color is 'blue', not dimmed
  })
})
