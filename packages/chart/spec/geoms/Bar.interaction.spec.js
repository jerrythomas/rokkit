import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { scaleBand, scaleLinear } from 'd3-scale'
import TestBar from '../helpers/TestBar.svelte'
import { createMockState } from '../helpers/mock-plot-state.js'

/**
 * Covers Bar's keyboard activation path and the inside-label contrast picker —
 * neither is reachable from the crossfilter spec, which only clicks bars.
 */
const barData = [
	{ category: 'A', value: 10 },
	{ category: 'B', value: 20 }
]

function barState(overrides = {}) {
	return createMockState({
		xScale: scaleBand().domain(['A', 'B']).range([0, 300]).padding(0.1),
		yScale: scaleLinear().domain([0, 40]).range([200, 0]),
		geomData: () => barData,
		colors: new Map([
			['A', { fill: '#4e79a7', stroke: null }],
			['B', { fill: '#f28e2b', stroke: null }]
		]),
		...overrides
	})
}

const bars = (container) => [...container.querySelectorAll('[data-plot-element="bar"], rect')]

describe('Bar — keyboard activation', () => {
	it.each(['Enter', ' '])('%s selects the bar', async (key) => {
		const onselect = vi.fn()
		const { container } = render(TestBar, { state: barState(), keyboard: true, onselect })
		await fireEvent.keyDown(bars(container)[0], { key })
		expect(onselect).toHaveBeenCalledWith(barData[0])
	})

	it('ignores keys other than Enter and Space', async () => {
		const onselect = vi.fn()
		const { container } = render(TestBar, { state: barState(), keyboard: true, onselect })
		await fireEvent.keyDown(bars(container)[0], { key: 'ArrowRight' })
		expect(onselect).not.toHaveBeenCalled()
	})

	it('routes through the filter path instead of onselect when filterable', async () => {
		const onselect = vi.fn()
		const { container } = render(TestBar, {
			state: barState(),
			keyboard: true,
			filterable: true,
			onselect
		})
		await fireEvent.keyDown(bars(container)[0], { key: 'Enter' })
		// filterable takes precedence: the bar filters rather than emitting a selection.
		expect(onselect).not.toHaveBeenCalled()
	})
})

describe('Bar — inside-label contrast', () => {
	const horizontal = (colors) =>
		barState({
			orientation: 'horizontal',
			xScale: scaleLinear().domain([0, 40]).range([0, 300]),
			yScale: scaleBand().domain(['A', 'B']).range([0, 200]).padding(0.1),
			...(colors ? { colors } : {})
		})

	const labelFill = (container) =>
		container.querySelector('[data-plot-element="label"]')?.getAttribute('fill')

	it('uses dark text on a light bar fill', () => {
		const colors = new Map([
			['A', { fill: '#ffffff', stroke: null }],
			['B', { fill: '#ffffff', stroke: null }]
		])
		const { container } = render(TestBar, {
			state: horizontal(colors),
			label: true,
			options: { orientation: 'horizontal', labelInside: true }
		})
		expect(labelFill(container)).toBe('#333')
	})

	it('uses white text on a dark bar fill', () => {
		const colors = new Map([
			['A', { fill: '#000000', stroke: null }],
			['B', { fill: '#000000', stroke: null }]
		])
		const { container } = render(TestBar, {
			state: horizontal(colors),
			label: true,
			options: { orientation: 'horizontal', labelInside: true }
		})
		expect(labelFill(container)).toBe('white')
	})

	it('falls back to white when the fill is not a full hex colour', () => {
		const colors = new Map([
			['A', { fill: 'red', stroke: null }],
			['B', { fill: '#fff', stroke: null }]
		])
		const { container } = render(TestBar, {
			state: horizontal(colors),
			label: true,
			options: { orientation: 'horizontal', labelInside: true }
		})
		expect(labelFill(container)).toBe('white')
	})
})
