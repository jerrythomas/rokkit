import { describe, it, expect } from 'vitest'
import { ChartBrewer } from '../../src/lib/brewing/brewer.svelte.js'

const data = [
  { month: 'Jan', revenue: 100, region: 'North' },
  { month: 'Feb', revenue: 200, region: 'South' },
  { month: 'Mar', revenue: 150, region: 'North' }
]

describe('ChartBrewer', () => {
  it('can be created', () => {
    const brewer = new ChartBrewer()
    expect(brewer).toBeDefined()
  })

  it('update() accepts data and channels', () => {
    const brewer = new ChartBrewer()
    brewer.update({ data, channels: { x: 'month', y: 'revenue' } })
    expect(brewer.bars).toHaveLength(3)
  })

  it('bars have fill from palette', () => {
    const brewer = new ChartBrewer()
    brewer.update({ data, channels: { x: 'month', y: 'revenue', color: 'region' } })
    expect(brewer.bars[0].fill).toBeTruthy()
  })

  it('colorMap has an entry for each distinct color value', () => {
    const brewer = new ChartBrewer()
    brewer.update({ data, channels: { x: 'month', y: 'revenue', color: 'region' } })
    expect(brewer.colorMap.size).toBe(2)
  })

  it('xScale and yScale are available', () => {
    const brewer = new ChartBrewer()
    brewer.update({ data, channels: { x: 'month', y: 'revenue' }, width: 400, height: 300 })
    expect(brewer.xScale).toBeDefined()
    expect(brewer.yScale).toBeDefined()
  })

  describe('transform hook', () => {
    it('processedData equals raw data when transform is identity', () => {
      const brewer = new ChartBrewer()
      const data = [{ x: 1, y: 2 }]
      brewer.update({ data })
      expect(brewer.processedData).toEqual(data)
    })
  })
})
