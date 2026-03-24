import { describe, it, expect } from 'vitest'
import { extractFrames, normalizeFrame, computeStaticDomains } from '../../../src/lib/plot/frames.js'

const rawData = [
  { year: 1999, class: 'compact', hwy: 29 },
  { year: 1999, class: 'suv',     hwy: 20 },
  { year: 2008, class: 'compact', hwy: 31 },
  // 2008/suv intentionally missing to test normalization
]

describe('extractFrames', () => {
  it('returns one entry per distinct time field value', () => {
    const frames = extractFrames(rawData, 'year')
    expect(frames.size).toBe(2)
    expect([...frames.keys()]).toEqual([1999, 2008])
  })

  it('each frame contains rows matching its time value', () => {
    const frames = extractFrames(rawData, 'year')
    expect(frames.get(1999)).toHaveLength(2)
    expect(frames.get(2008)).toHaveLength(1)
  })
})

describe('normalizeFrame', () => {
  it('fills missing (x, color) combinations with value 0', () => {
    const frames = extractFrames(rawData, 'year')
    const allXValues    = [...new Set(rawData.map((d) => d.class))]
    const allColorValues = null  // no color in this test

    const frame1999 = normalizeFrame(frames.get(1999), { x: 'class', y: 'hwy' }, allXValues, null)
    const frame2008 = normalizeFrame(frames.get(2008), { x: 'class', y: 'hwy' }, allXValues, null)

    // 2008 should have a 'suv' row filled in with hwy=0
    expect(frame2008).toHaveLength(2)
    const suv2008 = frame2008.find((r) => r.class === 'suv')
    expect(suv2008).toBeDefined()
    expect(suv2008.hwy).toBe(0)
  })

  it('leaves existing rows unchanged', () => {
    const frames = extractFrames(rawData, 'year')
    const allXValues = [...new Set(rawData.map((d) => d.class))]
    const frame1999 = normalizeFrame(frames.get(1999), { x: 'class', y: 'hwy' }, allXValues, null)
    const compact = frame1999.find((r) => r.class === 'compact')
    expect(compact?.hwy).toBe(29)
  })
})

describe('computeStaticDomains', () => {
  it('returns y domain spanning all frames combined', () => {
    const frames = extractFrames(rawData, 'year')
    const { yDomain } = computeStaticDomains(frames, { y: 'hwy' })
    expect(yDomain[0]).toBe(0)   // includeZero default
    expect(yDomain[1]).toBe(31)  // max across all rows
  })

  it('returns categorical x domain covering all frames', () => {
    const frames = extractFrames(rawData, 'year')
    const { xDomain } = computeStaticDomains(frames, { x: 'class', y: 'hwy' })
    expect(xDomain).toContain('compact')
    expect(xDomain).toContain('suv')
  })
})
