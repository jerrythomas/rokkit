import { describe, it, expect } from 'vitest'
import { BoxBrewer } from '../../src/lib/brewing/BoxBrewer.svelte.js'

const rawData = [
  { group: 'A', value: 10 }, { group: 'A', value: 20 }, { group: 'A', value: 30 },
  { group: 'A', value: 40 }, { group: 'A', value: 50 },
  { group: 'B', value: 100 }, { group: 'B', value: 200 }, { group: 'B', value: 300 }
]

describe('BoxBrewer.transform', () => {
  it('produces one row per group with quartile fields', () => {
    const brewer = new BoxBrewer()
    const result = brewer.transform(rawData, { x: 'group', y: 'value' })
    expect(result).toHaveLength(2)
    const a = result.find((r) => r.group === 'A')
    expect(a).toHaveProperty('q1')
    expect(a).toHaveProperty('median')
    expect(a).toHaveProperty('q3')
    expect(a).toHaveProperty('iqr_min')
    expect(a).toHaveProperty('iqr_max')
  })

  it('computes correct median for group A', () => {
    const brewer = new BoxBrewer()
    const result = brewer.transform(rawData, { x: 'group', y: 'value' })
    const a = result.find((r) => r.group === 'A')
    expect(a.median).toBe(30)
  })

  it('returns data unchanged when x or y is missing', () => {
    const brewer = new BoxBrewer()
    expect(brewer.transform(rawData, { y: 'value' })).toBe(rawData)
    expect(brewer.transform(rawData, { x: 'group' })).toBe(rawData)
  })

  it('groups by fill field when fill is set', () => {
    const brewer = new BoxBrewer()
    const data = [
      { group: 'A', region: 'N', value: 10 },
      { group: 'A', region: 'N', value: 20 },
      { group: 'A', region: 'S', value: 30 },
    ]
    const result = brewer.transform(data, { x: 'group', y: 'value', fill: 'region' })
    expect(result).toHaveLength(2) // A/N and A/S
  })
})
