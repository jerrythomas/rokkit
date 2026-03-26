import { describe, it, expect } from 'vitest'
import { defaultPreset, createChartPreset } from '../../src/lib/preset.js'

describe('defaultPreset', () => {
  it('has 14 colors', () => {
    expect(defaultPreset.colors).toHaveLength(14)
  })

  it('has light and dark shades', () => {
    expect(defaultPreset.shades).toHaveProperty('light')
    expect(defaultPreset.shades).toHaveProperty('dark')
    expect(defaultPreset.shades.light).toEqual({ fill: '300', stroke: '700' })
    expect(defaultPreset.shades.dark).toEqual({ fill: '500', stroke: '200' })
  })

  it('has opacity for area, box, violin, point', () => {
    expect(defaultPreset.opacity).toHaveProperty('area', 0.6)
    expect(defaultPreset.opacity).toHaveProperty('box', 0.5)
    expect(defaultPreset.opacity).toHaveProperty('violin', 0.5)
    expect(defaultPreset.opacity).toHaveProperty('point', 0.8)
  })
})

describe('createChartPreset', () => {
  it('returns defaultPreset when no overrides', () => {
    const p = createChartPreset()
    expect(p.colors).toEqual(defaultPreset.colors)
    expect(p.shades).toEqual(defaultPreset.shades)
    expect(p.opacity).toEqual(defaultPreset.opacity)
    expect(p.patterns).toEqual(defaultPreset.patterns)
    expect(p.symbols).toEqual(defaultPreset.symbols)
  })

  it('overrides colors array', () => {
    const colors = ['blue', 'rose']
    const p = createChartPreset({ colors })
    expect(p.colors).toEqual(colors)
    expect(p.opacity).toEqual(defaultPreset.opacity)
  })

  it('deep-merges opacity — partial override leaves other keys intact', () => {
    const p = createChartPreset({ opacity: { area: 0.3 } })
    expect(p.opacity.area).toBe(0.3)
    expect(p.opacity.box).toBe(defaultPreset.opacity.box)
    expect(p.opacity.violin).toBe(defaultPreset.opacity.violin)
    expect(p.opacity.point).toBe(defaultPreset.opacity.point)
  })

  it('deep-merges shades — partial override leaves other mode intact', () => {
    const p = createChartPreset({ shades: { light: { fill: '200', stroke: '800' } } })
    expect(p.shades.light.fill).toBe('200')
    expect(p.shades.light.stroke).toBe('800')
    expect(p.shades.dark).toEqual(defaultPreset.shades.dark)
  })

  it('overrides symbols array', () => {
    const symbols = ['circle', 'diamond']
    const p = createChartPreset({ symbols })
    expect(p.symbols).toEqual(symbols)
    expect(p.colors).toEqual(defaultPreset.colors)
  })
})
