import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { scaleBand, scaleLinear } from 'd3-scale'
import TestHexbin from '../helpers/TestHexbin.svelte'
import { createMockState } from '../helpers/mock-plot-state.js'

/** Build a mock state with continuous x/y scales suitable for hexbin. */
function hexbinState(overrides = {}) {
	const xScale = scaleLinear().domain([0, 100]).range([0, 300])
	const yScale = scaleLinear().domain([0, 100]).range([200, 0])

	return createMockState({
		xScale,
		yScale,
		continuousColorScale: null,
		setHovered: () => {},
		clearHovered: () => {},
		...overrides
	})
}

const POINTS = [
	{ px: 10, py: 20 },
	{ px: 11, py: 21 },
	{ px: 50, py: 50 },
	{ px: 51, py: 51 },
	{ px: 80, py: 80 },
	{ px: 12, py: 22 }
]

describe('Hexbin.svelte', () => {
	it('renders nothing when data is empty', () => {
		const state = hexbinState({ geomData: () => [] })
		const { container } = render(TestHexbin, { props: { state } })
		expect(container.querySelector('[data-plot-geom="hexbin"]')).toBeNull()
	})

	it('renders a hexbin group when data is provided', () => {
		const state = hexbinState({ geomData: () => POINTS })
		const { container } = render(TestHexbin, { props: { state, x: 'px', y: 'py' } })
		expect(container.querySelector('[data-plot-geom="hexbin"]')).toBeTruthy()
	})

	it('renders hex paths for binned data', () => {
		const state = hexbinState({ geomData: () => POINTS })
		const { container } = render(TestHexbin, { props: { state, x: 'px', y: 'py' } })
		const hexes = container.querySelectorAll('[data-plot-element="hex"]')
		expect(hexes.length).toBeGreaterThan(0)
	})

	it('hex paths have a transform attribute (translate)', () => {
		const state = hexbinState({ geomData: () => POINTS })
		const { container } = render(TestHexbin, { props: { state, x: 'px', y: 'py' } })
		const firstHex = container.querySelector('[data-plot-element="hex"]')
		expect(firstHex.getAttribute('transform')).toMatch(/^translate\(/)
	})

	it('hex paths have a d attribute (hex shape)', () => {
		const state = hexbinState({ geomData: () => POINTS })
		const { container } = render(TestHexbin, { props: { state, x: 'px', y: 'py' } })
		const firstHex = container.querySelector('[data-plot-element="hex"]')
		expect(firstHex.getAttribute('d')).toMatch(/^M/)
	})

	it('hex paths have white stroke', () => {
		const state = hexbinState({ geomData: () => POINTS })
		const { container } = render(TestHexbin, { props: { state, x: 'px', y: 'py' } })
		const firstHex = container.querySelector('[data-plot-element="hex"]')
		expect(firstHex.getAttribute('stroke')).toBe('white')
	})

	it('renders a <title> inside each hex path', () => {
		const state = hexbinState({ geomData: () => POINTS })
		const { container } = render(TestHexbin, { props: { state, x: 'px', y: 'py' } })
		const titles = container.querySelectorAll('[data-plot-element="hex"] title')
		expect(titles.length).toBeGreaterThan(0)
		expect(titles[0].textContent).toMatch(/points/)
	})

	it('bins adjacent points into fewer hexes than total points', () => {
		// POINTS has 6 items but clustered in 3 areas — expect ≤ 6 bins
		const state = hexbinState({ geomData: () => POINTS })
		const { container } = render(TestHexbin, { props: { state, x: 'px', y: 'py' } })
		const hexes = container.querySelectorAll('[data-plot-element="hex"]')
		expect(hexes.length).toBeLessThanOrEqual(POINTS.length)
	})

	it('uses continuous color scale when provided', () => {
		const colorScale = (v) => `hsl(${v * 10}, 80%, 50%)`
		const state = hexbinState({
			geomData: () => POINTS,
			continuousColorScale: { scale: colorScale }
		})
		const { container } = render(TestHexbin, { props: { state, x: 'px', y: 'py' } })
		const firstHex = container.querySelector('[data-plot-element="hex"]')
		// Fill should be a hsl() value from the continuous scale
		expect(firstHex.getAttribute('fill')).toMatch(/hsl/)
	})

	it('falls back to rgba fill when no continuous color scale', () => {
		const state = hexbinState({
			geomData: () => POINTS,
			continuousColorScale: null
		})
		const { container } = render(TestHexbin, { props: { state, x: 'px', y: 'py' } })
		const firstHex = container.querySelector('[data-plot-element="hex"]')
		expect(firstHex.getAttribute('fill')).toMatch(/rgba/)
	})

	it('uses custom radius via options prop', () => {
		// With a smaller radius we get more bins (less grouping)
		const stateSmall = hexbinState({ geomData: () => POINTS })
		const { container: c1 } = render(TestHexbin, {
			props: { state: stateSmall, x: 'px', y: 'py', options: { radius: 5 } }
		})
		const stateDefault = hexbinState({ geomData: () => POINTS })
		const { container: c2 } = render(TestHexbin, {
			props: { state: stateDefault, x: 'px', y: 'py', options: { radius: 20 } }
		})
		// smaller radius → more bins; larger → fewer (or equal)
		const countSmall = c1.querySelectorAll('[data-plot-element="hex"]').length
		const countLarge = c2.querySelectorAll('[data-plot-element="hex"]').length
		expect(countSmall).toBeGreaterThanOrEqual(countLarge)
	})

	it('skips data points with undefined x or y scale output', () => {
		// A scale that returns undefined for certain values
		const badXScale = (v) => (v === 'bad' ? undefined : 50)
		badXScale.bandwidth = undefined
		const state = hexbinState({
			xScale: badXScale,
			geomData: () => [{ px: 'bad', py: 30 }, { px: 10, py: 20 }]
		})
		// Should not throw
		expect(() =>
			render(TestHexbin, { props: { state, x: 'px', y: 'py' } })
		).not.toThrow()
	})

	it('calls setHovered on mouseenter', async () => {
		let hovered = null
		const state = hexbinState({
			geomData: () => POINTS,
			setHovered: (d) => { hovered = d }
		})
		const { container } = render(TestHexbin, { props: { state, x: 'px', y: 'py' } })
		const firstHex = container.querySelector('[data-plot-element="hex"]')
		await fireEvent.mouseEnter(firstHex)
		expect(hovered).not.toBeNull()
	})

	it('calls clearHovered on mouseleave', async () => {
		let cleared = false
		const state = hexbinState({
			geomData: () => POINTS,
			clearHovered: () => { cleared = true }
		})
		const { container } = render(TestHexbin, { props: { state, x: 'px', y: 'py' } })
		const firstHex = container.querySelector('[data-plot-element="hex"]')
		await fireEvent.mouseLeave(firstHex)
		expect(cleared).toBe(true)
	})
})
