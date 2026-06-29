import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { scaleBand } from 'd3-scale'
import TestHeatmap from '../helpers/TestHeatmap.svelte'
import { createMockState } from '../helpers/mock-plot-state.js'

const HEATMAP_DATA = [
	{ col: 'Mon', row: 'Morning', temp: 20 },
	{ col: 'Mon', row: 'Afternoon', temp: 28 },
	{ col: 'Tue', row: 'Morning', temp: 22 },
	{ col: 'Tue', row: 'Afternoon', temp: 30 }
]

function heatmapState(overrides = {}) {
	const xScale = scaleBand().domain(['Mon', 'Tue', 'Wed']).range([0, 300]).padding(0.05)
	const yScale = scaleBand()
		.domain(['Morning', 'Afternoon', 'Evening'])
		.range([200, 0])
		.padding(0.05)

	return createMockState({
		xScale,
		yScale,
		continuousColorScale: null,
		setHovered: () => {},
		clearHovered: () => {},
		...overrides
	})
}

describe('Heatmap.svelte', () => {
	it('renders nothing when data is empty', () => {
		const state = heatmapState({ geomData: () => [] })
		const { container } = render(TestHeatmap, {
			props: { state, x: 'col', y: 'row', color: 'temp' }
		})
		expect(container.querySelector('[data-plot-geom="heatmap"]')).toBeNull()
	})

	it('renders a heatmap group for non-empty data', () => {
		const state = heatmapState({ geomData: () => HEATMAP_DATA })
		const { container } = render(TestHeatmap, {
			props: { state, x: 'col', y: 'row', color: 'temp' }
		})
		expect(container.querySelector('[data-plot-geom="heatmap"]')).toBeTruthy()
	})

	it('renders one <rect> per data row', () => {
		const state = heatmapState({ geomData: () => HEATMAP_DATA })
		const { container } = render(TestHeatmap, {
			props: { state, x: 'col', y: 'row', color: 'temp' }
		})
		const cells = container.querySelectorAll('[data-plot-element="cell"]')
		expect(cells.length).toBe(HEATMAP_DATA.length)
	})

	it('cells have x and y attributes', () => {
		const state = heatmapState({ geomData: () => HEATMAP_DATA })
		const { container } = render(TestHeatmap, {
			props: { state, x: 'col', y: 'row', color: 'temp' }
		})
		const firstCell = container.querySelector('[data-plot-element="cell"]')
		expect(firstCell.getAttribute('x')).not.toBeNull()
		expect(firstCell.getAttribute('y')).not.toBeNull()
	})

	it('cells have width and height from band scale', () => {
		const state = heatmapState({ geomData: () => HEATMAP_DATA })
		const { container } = render(TestHeatmap, {
			props: { state, x: 'col', y: 'row', color: 'temp' }
		})
		const firstCell = container.querySelector('[data-plot-element="cell"]')
		expect(Number(firstCell.getAttribute('width'))).toBeGreaterThan(0)
		expect(Number(firstCell.getAttribute('height'))).toBeGreaterThan(0)
	})

	it('cells have a fill attribute', () => {
		const state = heatmapState({ geomData: () => HEATMAP_DATA })
		const { container } = render(TestHeatmap, {
			props: { state, x: 'col', y: 'row', color: 'temp' }
		})
		const firstCell = container.querySelector('[data-plot-element="cell"]')
		expect(firstCell.getAttribute('fill')).toBeTruthy()
	})

	it('uses continuous color scale when provided', () => {
		const colorScale = (v) => `hsl(${v * 3}, 80%, 50%)`
		const state = heatmapState({
			geomData: () => HEATMAP_DATA,
			continuousColorScale: { scale: colorScale }
		})
		const { container } = render(TestHeatmap, {
			props: { state, x: 'col', y: 'row', color: 'temp' }
		})
		const cells = container.querySelectorAll('[data-plot-element="cell"]')
		// All cells should have a hsl fill from the continuous color scale
		cells.forEach((cell) => {
			expect(cell.getAttribute('fill')).toMatch(/hsl/)
		})
	})

	it('uses categorical colors when available', () => {
		// Use categorical color mapped to a color value field
		const state = heatmapState({
			geomData: () => [
				{ col: 'Mon', row: 'Morning', cat: 'a' },
				{ col: 'Tue', row: 'Morning', cat: 'b' }
			],
			colors: new Map([
				['a', { fill: '#ff0000', stroke: '#ff0000' }],
				['b', { fill: '#0000ff', stroke: '#0000ff' }]
			])
		})
		const { container } = render(TestHeatmap, {
			props: { state, x: 'col', y: 'row', color: 'cat' }
		})
		const cells = container.querySelectorAll('[data-plot-element="cell"]')
		expect(cells[0].getAttribute('fill')).toBe('#ff0000')
		expect(cells[1].getAttribute('fill')).toBe('#0000ff')
	})

	it('falls back to #ccc when color value not in categorical map', () => {
		const state = heatmapState({
			geomData: () => [{ col: 'Mon', row: 'Morning', cat: 'unknown' }],
			colors: new Map()
		})
		const { container } = render(TestHeatmap, {
			props: { state, x: 'col', y: 'row', color: 'cat' }
		})
		const cell = container.querySelector('[data-plot-element="cell"]')
		expect(cell.getAttribute('fill')).toBe('#ccc')
	})

	it('renders a <title> inside each cell', () => {
		const state = heatmapState({ geomData: () => HEATMAP_DATA })
		const { container } = render(TestHeatmap, {
			props: { state, x: 'col', y: 'row', color: 'temp' }
		})
		const titles = container.querySelectorAll('[data-plot-element="cell"] title')
		expect(titles.length).toBe(HEATMAP_DATA.length)
	})

	it('applies rx attribute from options.rounded', () => {
		const state = heatmapState({ geomData: () => HEATMAP_DATA })
		const { container } = render(TestHeatmap, {
			props: { state, x: 'col', y: 'row', color: 'temp', options: { rounded: 4 } }
		})
		const firstCell = container.querySelector('[data-plot-element="cell"]')
		expect(firstCell.getAttribute('rx')).toBe('4')
	})

	it('calls setHovered on mouseenter', async () => {
		let hovered = null
		const state = heatmapState({
			geomData: () => HEATMAP_DATA,
			setHovered: (d) => { hovered = d }
		})
		const { container } = render(TestHeatmap, {
			props: { state, x: 'col', y: 'row', color: 'temp' }
		})
		const firstCell = container.querySelector('[data-plot-element="cell"]')
		await fireEvent.mouseEnter(firstCell)
		expect(hovered).not.toBeNull()
	})

	it('calls clearHovered on mouseleave', async () => {
		let cleared = false
		const state = heatmapState({
			geomData: () => HEATMAP_DATA,
			clearHovered: () => { cleared = true }
		})
		const { container } = render(TestHeatmap, {
			props: { state, x: 'col', y: 'row', color: 'temp' }
		})
		const firstCell = container.querySelector('[data-plot-element="cell"]')
		await fireEvent.mouseLeave(firstCell)
		expect(cleared).toBe(true)
	})

	it('uses fill prop (fillProp) as color channel', () => {
		const state = heatmapState({ geomData: () => HEATMAP_DATA })
		expect(() =>
			render(TestHeatmap, { props: { state, x: 'col', y: 'row', fill: 'temp' } })
		).not.toThrow()
	})
})
