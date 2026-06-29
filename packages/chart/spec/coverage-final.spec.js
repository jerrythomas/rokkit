import { describe, it, expect } from 'vitest'
import mpg from './fixtures/mpg.json'
import * as chart from '../src/index.js'
import { PlotState } from '../src/PlotState.svelte.js'
import { QuartileBrewer } from '../src/lib/brewing/QuartileBrewer.svelte.js'

describe('chart index barrel', () => {
	it('re-exports the Plot primitives and top-level components', () => {
		expect(chart.Plot).toBeDefined()
		expect(chart.Plot.Root).toBeDefined()
		expect(chart.Plot.Bar).toBeDefined()
		expect(chart.PlotLayers).toBe(chart.Plot) // deprecated alias
		expect(chart.PlotChart).toBeDefined()
		expect(chart.ChartProvider).toBeDefined()
	})
})

describe('PlotState.continuousColorScale', () => {
	it('is null for a categorical color field', () => {
		const s = new PlotState({ data: mpg, channels: { color: 'class' } })
		expect(s.colorScaleType).toBe('categorical')
		expect(s.continuousColorScale).toBeNull()
	})

	it('builds a sequential scale for a numeric color field', () => {
		const s = new PlotState({ data: mpg, channels: { color: 'cty' } })
		expect(s.colorScaleType).toBe('sequential')
		expect(s.continuousColorScale).toBeTruthy()
	})

	it('builds a diverging scale when a colorMidpoint is set', () => {
		const s = new PlotState({ data: mpg, channels: { color: 'cty' }, colorMidpoint: 20 })
		expect(s.colorScaleType).toBe('diverging')
		expect(s.continuousColorScale).toBeTruthy()
	})
})

describe('QuartileBrewer scales', () => {
	it('derives x and y scales from grouped quartile data', () => {
		const brewer = new QuartileBrewer()
		brewer.update({ data: mpg, channels: { x: 'class', y: 'cty' }, width: 600, height: 400 })
		expect(brewer.xScale).toBeTruthy()
		expect(brewer.yScale).toBeTruthy()
	})
})
