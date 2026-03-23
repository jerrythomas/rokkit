import { describe, it, expect } from 'vitest'
import { CartesianBrewer } from '../../src/lib/brewing/CartesianBrewer.svelte.js'

const data = [
  { month: 'Jan', region: 'North', revenue: 10 },
  { month: 'Jan', region: 'North', revenue: 20 },
  { month: 'Jan', region: 'South', revenue: 30 },
  { month: 'Feb', region: 'North', revenue: 15 }
]

describe('CartesianBrewer.transform', () => {
  it('returns data unchanged for identity stat', () => {
    const brewer = new CartesianBrewer()
    const result = brewer.transform(data, { x: 'month', y: 'revenue' }, 'identity')
    expect(result).toBe(data)
  })

  it('groups by x only when no color channel', () => {
    const brewer = new CartesianBrewer()
    const result = brewer.transform(data, { x: 'month', y: 'revenue' }, 'sum')
    expect(result).toHaveLength(2) // Jan + Feb
    expect(result.find((r) => r.month === 'Jan').revenue).toBe(60)
  })

  it('groups by x and color when color is set', () => {
    const brewer = new CartesianBrewer()
    const result = brewer.transform(data, { x: 'month', y: 'revenue', color: 'region' }, 'sum')
    // Jan/North=30, Jan/South=30, Feb/North=15
    expect(result).toHaveLength(3)
  })

  it('applies mean stat', () => {
    const brewer = new CartesianBrewer()
    const result = brewer.transform(data, { x: 'month', y: 'revenue' }, 'mean')
    expect(result.find((r) => r.month === 'Jan').revenue).toBe(20) // (10+20+30)/3
  })

  it('accepts a custom function', () => {
    const brewer = new CartesianBrewer()
    const double = (vals) => vals.reduce((a, b) => a + b, 0) * 2
    const result = brewer.transform(data, { x: 'month', y: 'revenue' }, double)
    expect(result.find((r) => r.month === 'Jan').revenue).toBe(120)
  })
})
