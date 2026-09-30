import { describe, it, expect } from 'vitest'
import { scaleBand, scaleLinear } from 'd3-scale'
import { PlotConfig } from '../../src/state/PlotConfig.svelte.js'
import { AxisState } from '../../src/state/AxisState.svelte.js'

const frame = { innerWidth: 300, innerHeight: 200 }
const make = (x, y, config = {}) => new AxisState(new PlotConfig(config), { x, y }, frame)

describe('AxisState — where the axes cross', () => {
	it('pins to the bottom and left edges for first-quadrant data', () => {
		const a = make(
			scaleLinear().domain([1, 5]).range([0, 300]),
			scaleLinear().domain([1, 5]).range([200, 0])
		)
		expect(a.xAxisY).toBe(200)
		expect(a.yAxisX).toBe(0)
	})

	it('crosses at zero when the domain spans it', () => {
		const a = make(
			scaleLinear().domain([-5, 5]).range([0, 300]),
			scaleLinear().domain([-5, 5]).range([200, 0])
		)
		expect(a.xAxisY).toBe(100)
		expect(a.yAxisX).toBe(150)
	})

	it('crosses at an explicit axis origin', () => {
		const a = make(
			scaleLinear().domain([0, 10]).range([0, 300]),
			scaleLinear().domain([0, 10]).range([200, 0]),
			{
				axisOrigin: [5, 5]
			}
		)
		expect([a.xAxisY, a.yAxisX]).toEqual([100, 150])
	})

	it('offsets an edge-pinned axis outward', () => {
		const a = make(
			scaleLinear().domain([1, 5]).range([0, 300]),
			scaleLinear().domain([1, 5]).range([200, 0]),
			{
				axisOffset: 6
			}
		)
		expect([a.xAxisY, a.yAxisX]).toEqual([206, -6])
	})

	it('never turns an empty domain into NaN — a race’s first frame has no rows yet', () => {
		const a = make(
			scaleLinear().domain([]).range([0, 300]),
			scaleLinear().domain([]).range([200, 0])
		)
		expect(Number.isNaN(a.xAxisY)).toBe(false)
		expect(Number.isNaN(a.yAxisX)).toBe(false)
	})

	it('pins a band x axis to the left, and defaults with no scales', () => {
		const band = make(
			scaleBand().domain(['a']).range([0, 300]),
			scaleLinear().domain([1, 5]).range([200, 0])
		)
		expect(band.yAxisX).toBe(0)
		const none = make(null, null)
		expect([none.xAxisY, none.yAxisX]).toEqual([200, 0])
	})
})
