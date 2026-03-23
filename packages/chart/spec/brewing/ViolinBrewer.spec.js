import { describe, it, expect } from 'vitest'
import { ViolinBrewer } from '../../src/lib/brewing/ViolinBrewer.svelte.js'

const rawData = [
  { group: 'A', value: 10 }, { group: 'A', value: 20 }, { group: 'A', value: 30 },
  { group: 'A', value: 40 }, { group: 'A', value: 50 },
  { group: 'B', value: 15 }, { group: 'B', value: 25 }, { group: 'B', value: 35 }
]

describe('ViolinBrewer.transform', () => {
  it('produces one row per group with quartile fields', () => {
    const brewer = new ViolinBrewer()
    const result = brewer.transform(rawData, { x: 'group', y: 'value' })
    expect(result).toHaveLength(2)
    const a = result.find((r) => r.group === 'A')
    expect(a).toHaveProperty('q1')
    expect(a).toHaveProperty('median')
    expect(a).toHaveProperty('q3')
    expect(a).toHaveProperty('iqr_min')
    expect(a).toHaveProperty('iqr_max')
  })

  it('returns data unchanged when x or y is missing', () => {
    const brewer = new ViolinBrewer()
    expect(brewer.transform(rawData, { y: 'value' })).toBe(rawData)
    expect(brewer.transform(rawData, { x: 'group' })).toBe(rawData)
  })
})
