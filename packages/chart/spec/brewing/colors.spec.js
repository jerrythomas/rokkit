import { describe, it, expect } from 'vitest'
import palette from '../../src/lib/brewing/palette.json'
import { assignColors, distinct } from '../../src/lib/brewing/colors.js'

describe('palette.json', () => {
  it('has exactly 21 colors', () => {
    expect(palette).toHaveLength(21)
  })

  it('each entry has light and dark shades with fill and stroke', () => {
    for (const entry of palette) {
      expect(entry.shades.light).toHaveProperty('fill')
      expect(entry.shades.light).toHaveProperty('stroke')
      expect(entry.shades.dark).toHaveProperty('fill')
      expect(entry.shades.dark).toHaveProperty('stroke')
    }
  })
})

describe('assignColors', () => {
  it('assigns colors from palette by index', () => {
    const values = ['a', 'b', 'c']
    const result = assignColors(values, 'light')
    expect(result.get('a')).toEqual(palette[0].shades.light)
    expect(result.get('b')).toEqual(palette[1].shades.light)
    expect(result.get('c')).toEqual(palette[2].shades.light)
  })

  it('cycles past 21 values', () => {
    const values = Array.from({ length: 22 }, (_, i) => `v${i}`)
    const result = assignColors(values, 'light')
    expect(result.get('v21')).toEqual(palette[0].shades.light)
  })

  it('uses dark shades in dark mode', () => {
    const values = ['x']
    const result = assignColors(values, 'dark')
    expect(result.get('x')).toEqual(palette[0].shades.dark)
  })
})

describe('distinct', () => {
  it('returns distinct values for a field', () => {
    const data = [{ region: 'North' }, { region: 'South' }, { region: 'North' }]
    expect(distinct(data, 'region')).toEqual(['North', 'South'])
  })

  it('returns empty array if field is null', () => {
    expect(distinct([{ x: 1 }], null)).toEqual([])
  })
})
