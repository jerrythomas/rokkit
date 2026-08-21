import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import {
	Plot,
	GeomHighlight,
	GeomTrend,
	GeomBox,
	GeomViolin,
	GeomJitter,
	GeomRule,
	Spark,
	SparkState,
	GEOM_CONTRACT,
	GeomRadar,
	RadarChart
} from '../src/index.js'

describe('chart exports', () => {
	it('exposes Highlight + Trend on the Plot namespace and as Geom*', () => {
		expect(Plot.Highlight).toBeTruthy()
		expect(Plot.Trend).toBeTruthy()
		expect(GeomHighlight).toBeTruthy()
		expect(GeomTrend).toBeTruthy()
	})

	it('exposes Box/Violin/Jitter on the Plot namespace', () => {
		expect(Plot.Box).toBeTruthy()
		expect(Plot.Violin).toBeTruthy()
		expect(Plot.Jitter).toBeTruthy()
	})

	it('exposes GeomBox/GeomViolin/GeomJitter aliases', () => {
		expect(GeomBox).toBeTruthy()
		expect(GeomViolin).toBeTruthy()
		expect(GeomJitter).toBeTruthy()
	})

	it('exposes Candlestick/Heatmap/Hexbin/Ribbon/Waterfall on the Plot namespace', () => {
		expect(Plot.Candlestick).toBeTruthy()
		expect(Plot.Heatmap).toBeTruthy()
		expect(Plot.Hexbin).toBeTruthy()
		expect(Plot.Ribbon).toBeTruthy()
		expect(Plot.Waterfall).toBeTruthy()
	})

	it('exposes Rule (reference line) on the Plot namespace and as GeomRule', () => {
		expect(Plot.Rule).toBeTruthy()
		expect(GeomRule).toBeTruthy()
	})

	it('exposes Spark as a real component — rendering it produces the spark svg', () => {
		// A missing/undefined export throws on render rather than merely being falsy, so this
		// proves Spark resolved to an actual Svelte component, not just "some truthy value".
		const { container } = render(Spark, { props: { data: [{ x: 0, y: 1 }], x: 'x', y: 'y' } })
		expect(container.querySelector('svg[data-spark]')).toBeTruthy()
	})

	it('exposes SparkState as a class — constructing it yields a SparkState instance', () => {
		expect(typeof SparkState).toBe('function')
		const instance = new SparkState({ data: [{ x: 0, y: 1 }], channels: { x: 'x', y: 'y' } })
		expect(instance).toBeInstanceOf(SparkState)
		// A real instance, not a stub — it carries the actual scale/data surface.
		expect(instance.data).toEqual([{ x: 0, y: 1 }])
	})

	it('exposes GEOM_CONTRACT as a non-empty array of member names', () => {
		expect(Array.isArray(GEOM_CONTRACT)).toBe(true)
		expect(GEOM_CONTRACT.length).toBeGreaterThan(0)
		expect(GEOM_CONTRACT).toContain('xScale')
	})

	it('exposes RadarChart, and it renders a real radar rather than an empty shell', () => {
		// Rendering (not just truthiness) is what proves the export resolved to an actual
		// component — an undefined export throws here.
		const { container } = render(RadarChart, {
			props: {
				data: [
					{ metric: 'a', score: 3, team: 'T' },
					{ metric: 'b', score: 6, team: 'T' }
				],
				axis: 'metric',
				value: 'score',
				series: 'team',
				axes: ['a', 'b']
			}
		})
		expect(container.querySelector('[data-plot-element="radar-area"]')).toBeTruthy()
	})

	it('exposes Radar as GeomRadar, following the Geom* convention', () => {
		expect(GeomRadar).toBeTruthy()
		expect(typeof GeomRadar).toBe('function')
	})
})
