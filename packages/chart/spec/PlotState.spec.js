import { describe, it, expect, vi } from 'vitest'
import mpg from './fixtures/mpg.json'
import { PlotState } from '../src/PlotState.svelte.js'

describe('PlotState — label resolution', () => {
  it('returns field name when no labels defined', () => {
    const state = new PlotState({ data: mpg, channels: { x: 'class', y: 'cty' }, labels: {} })
    expect(state.label('class')).toBe('class')
    expect(state.label('cty')).toBe('cty')
  })

  it('returns display label when defined', () => {
    const state = new PlotState({
      data: mpg,
      channels: { x: 'class', y: 'cty' },
      labels: { cty: 'City MPG', class: 'Vehicle Class' }
    })
    expect(state.label('cty')).toBe('City MPG')
    expect(state.label('class')).toBe('Vehicle Class')
  })
})

describe('PlotState — geom registration and stat', () => {
  it('registerGeom stores a geom config', () => {
    const state = new PlotState({ data: mpg, channels: { x: 'class', y: 'cty' } })
    const id = state.registerGeom({ type: 'bar', channels: { x: 'class', y: 'cty' }, stat: 'identity' })
    expect(typeof id).toBe('string')
  })

  it('geomData returns post-stat rows for registered geom (identity)', () => {
    const state = new PlotState({ data: mpg, channels: { x: 'class', y: 'cty' } })
    const id = state.registerGeom({ type: 'bar', channels: { x: 'class', y: 'cty' }, stat: 'identity' })
    const rows = state.geomData(id)
    expect(rows).toBe(mpg)
  })

  it('geomData returns aggregated rows for stat=sum', () => {
    const state = new PlotState({ data: mpg, channels: { x: 'class', y: 'cty' } })
    const id = state.registerGeom({ type: 'bar', channels: { x: 'class', y: 'cty' }, stat: 'sum' })
    const rows = state.geomData(id)
    expect(rows.length).toBeLessThan(mpg.length)
    expect(rows[0]).toHaveProperty('class')
    expect(rows[0]).toHaveProperty('cty')
  })

  it('geomData with stat=mean produces correct average', () => {
    const state = new PlotState({ data: mpg, channels: { x: 'class', y: 'hwy' } })
    const id = state.registerGeom({ type: 'bar', channels: { x: 'class', y: 'hwy' }, stat: 'mean' })
    const rows = state.geomData(id)
    const compact = rows.find((r) => r.class === 'compact')
    const expectedMean = mpg.filter((r) => r.class === 'compact').reduce((a, r) => a + r.hwy, 0)
      / mpg.filter((r) => r.class === 'compact').length
    expect(compact.hwy).toBeCloseTo(expectedMean)
  })
})

describe('PlotState — color scale type inference', () => {
  it('infers categorical for string color field', () => {
    const state = new PlotState({ data: mpg, channels: { color: 'class' } })
    expect(state.colorScaleType).toBe('categorical')
  })

  it('infers sequential for numeric color field', () => {
    const state = new PlotState({ data: mpg, channels: { color: 'cty' } })
    expect(state.colorScaleType).toBe('sequential')
  })

  it('infers diverging when colorMidpoint set', () => {
    const state = new PlotState({ data: mpg, channels: { color: 'cty' }, colorMidpoint: 20 })
    expect(state.colorScaleType).toBe('diverging')
  })
})

describe('PlotState — orientation inference', () => {
  it('infers vertical when x is categorical (class)', () => {
    const state = new PlotState({ data: mpg, channels: { x: 'class', y: 'cty' }, width: 600, height: 400 })
    state.registerGeom({ type: 'bar', channels: { x: 'class', y: 'cty' }, stat: 'mean' })
    expect(state.orientation).toBe('vertical')
  })

  it('infers horizontal when y is categorical', () => {
    const state = new PlotState({ data: mpg, channels: { x: 'cty', y: 'class' }, width: 600, height: 400 })
    state.registerGeom({ type: 'bar', channels: { x: 'cty', y: 'class' }, stat: 'mean' })
    expect(state.orientation).toBe('horizontal')
  })

  it('infers none for scatter (both continuous)', () => {
    const state = new PlotState({ data: mpg, channels: { x: 'cty', y: 'hwy' }, width: 600, height: 400 })
    state.registerGeom({ type: 'point', channels: { x: 'cty', y: 'hwy' }, stat: 'identity' })
    expect(state.orientation).toBe('none')
  })
})

describe('PlotState — scale domain includes zero for bar charts', () => {
  it('yScale starts at 0 for vertical bar chart', () => {
    const state = new PlotState({ data: mpg, channels: { x: 'class', y: 'cty' }, width: 600, height: 400 })
    state.registerGeom({ type: 'bar', channels: { x: 'class', y: 'cty' }, stat: 'mean' })
    expect(state.yScale.domain()[0]).toBe(0)
  })

  it('xScale starts at 0 for horizontal bar chart', () => {
    const state = new PlotState({ data: mpg, channels: { x: 'cty', y: 'class' }, width: 600, height: 400 })
    state.registerGeom({ type: 'bar', channels: { x: 'cty', y: 'class' }, stat: 'mean' })
    expect(state.xScale.domain()[0]).toBe(0)
  })

  it('yScale does NOT start at 0 for scatter (extent domain)', () => {
    const state = new PlotState({ data: mpg, channels: { x: 'displ', y: 'hwy' }, width: 600, height: 400 })
    state.registerGeom({ type: 'point', channels: { x: 'displ', y: 'hwy' }, stat: 'identity' })
    expect(state.yScale.domain()[0]).toBeGreaterThan(0)
  })
})

describe('PlotState — axisOrigin', () => {
  it('axisOrigin defaults to [undefined, undefined]', () => {
    const state = new PlotState({ data: mpg, channels: { x: 'class', y: 'cty' } })
    expect(state.axisOrigin).toEqual([undefined, undefined])
  })

  it('xAxisY returns innerHeight when no yScale', () => {
    const state = new PlotState({ data: mpg, channels: {}, width: 600, height: 400 })
    expect(state.xAxisY).toBe(state.innerHeight)
  })

  it('axisOrigin can be set for quadrant mode', () => {
    const state = new PlotState({ data: mpg, channels: { x: 'displ', y: 'hwy' }, width: 600, height: 400 })
    state.registerGeom({ type: 'point', channels: { x: 'displ', y: 'hwy' }, stat: 'identity' })
    state.axisOrigin = [0, 0]
    const atZero = state.yScale(0)
    expect(state.xAxisY).toBe(atZero)
  })
})

describe('PlotState — preset from spec config', () => {
  it('resolves preset by name from config.preset', () => {
    const brandPreset = { colors: ['#ff0000'], patterns: [], symbols: [] }
    const state = new PlotState({
      data: mpg,
      channels: {},
      preset: 'brand',
      helpers: { presets: { brand: brandPreset } }
    })
    expect(state.preset().colors).toEqual(['#ff0000'])
  })

  it('returns default preset when no preset in config', () => {
    const state = new PlotState({ data: mpg, channels: {} })
    expect(state.preset().colors.length).toBeGreaterThan(0)
  })
})
