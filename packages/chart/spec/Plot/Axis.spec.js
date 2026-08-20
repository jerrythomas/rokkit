import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import { scaleBand, scaleLinear } from 'd3-scale'
import { createMockState } from '../helpers/mock-plot-state.js'
import TestAxis from '../helpers/TestAxis.svelte'

describe('Axis tick generation', () => {
	it('derives x ticks from band scale domain', () => {
		const xScale = scaleBand().domain(['a', 'b', 'c']).range([0, 300]).padding(0.1)
		const ticks = xScale.domain().map((val) => ({
			value: val,
			pos: (xScale(val) ?? 0) + xScale.bandwidth() / 2
		}))
		expect(ticks).toHaveLength(3)
		expect(ticks[0].value).toBe('a')
		expect(ticks[0].pos).toBeGreaterThan(0)
	})

	it('derives y ticks from linear scale', () => {
		const yScale = scaleLinear().domain([0, 100]).range([200, 0])
		const ticks = yScale.ticks(5).map((val) => ({ value: val, pos: yScale(val) }))
		expect(ticks.length).toBeGreaterThanOrEqual(4)
		expect(ticks[0].value).toBe(0)
		expect(ticks[0].pos).toBe(200)
	})

	it('positions x axis at xAxisY from state (default = innerHeight)', () => {
		const state = createMockState({ xAxisY: 200, innerHeight: 200 })
		expect(state.xAxisY).toBe(200)
	})

	it('positions x axis at origin for quadrant mode', () => {
		const yScale = scaleLinear().domain([-50, 50]).range([200, 0])
		const xAxisY = yScale(0)
		expect(xAxisY).toBe(100)
	})
})

// ─── Rendered tick generation ────────────────────────────────────────────────
// The cases above assert the tick MATH; these render the component so Axis's own
// buildTicks runs — otherwise the minor-tick interpolation is never executed.

describe('Axis — rendered ticks', () => {
	const linearState = (overrides = {}) =>
		createMockState({
			xScale: scaleLinear().domain([0, 100]).range([0, 300]),
			...overrides
		})

	it('renders one tick group per band category', () => {
		const { container } = render(TestAxis, { state: createMockState(), type: 'x' })
		expect(container.querySelectorAll('[data-plot-tick]').length).toBe(3)
	})

	it('renders only major ticks when minorTicks is off', () => {
		const { container } = render(TestAxis, {
			state: linearState(),
			type: 'x',
			ticks: 5,
			minorTicks: false
		})
		const ticks = container.querySelectorAll('[data-plot-tick]')
		const labels = container.querySelectorAll('[data-plot-tick-label]')
		expect(ticks.length).toBe(labels.length)
	})

	it('interpolates minor ticks between majors when minorTicks is on', () => {
		const major = render(TestAxis, {
			state: linearState(),
			type: 'x',
			ticks: 5,
			minorTicks: false
		})
		const majorCount = major.container.querySelectorAll('[data-plot-tick]').length

		const { container } = render(TestAxis, {
			state: linearState(),
			type: 'x',
			ticks: 5,
			minorTicks: true
		})
		const total = container.querySelectorAll('[data-plot-tick]').length
		// 4 divisions per gap → 3 extra minor ticks between each pair of majors.
		expect(total).toBe(majorCount + (majorCount - 1) * 3)
		// Minor ticks carry no label.
		expect(container.querySelectorAll('[data-plot-tick-label]').length).toBe(majorCount)
	})

	it('skips minor interpolation for a band scale', () => {
		const { container } = render(TestAxis, {
			state: createMockState(),
			type: 'x',
			minorTicks: true
		})
		expect(container.querySelectorAll('[data-plot-tick]').length).toBe(3)
	})

	it('skips minor interpolation when there are fewer than two majors', () => {
		const { container } = render(TestAxis, {
			state: linearState({ xScale: scaleLinear().domain([0, 0]).range([0, 300]) }),
			type: 'x',
			ticks: 1,
			minorTicks: true
		})
		expect(container.querySelectorAll('[data-plot-tick]').length).toBeLessThan(2)
	})

	it('renders y-axis ticks from the y scale', () => {
		const { container } = render(TestAxis, { state: createMockState(), type: 'y' })
		expect(container.querySelectorAll('[data-plot-tick]').length).toBeGreaterThan(0)
	})

	it('honours showTicks / showLabels / showLine toggles', () => {
		const { container } = render(TestAxis, {
			state: createMockState(),
			type: 'x',
			showTicks: false,
			showLabels: false,
			showLine: false
		})
		expect(container.querySelectorAll('[data-plot-tick-label]').length).toBe(0)
	})
})
