import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { scaleBand, scaleLinear } from 'd3-scale'
import TestBox from '../helpers/TestBox.svelte'
import { createMockState } from '../helpers/mock-plot-state.js'
import { PlotState } from '../../src/PlotState.svelte.js'

// One pre-aggregated box row with a single outlier at y=95.
const BOX_ROWS = [
	{ cat: 'A', q1: 20, median: 40, q3: 60, iqr_min: 10, iqr_max: 80, outliers: [95] }
]

function boxState(rows = BOX_ROWS, overrides = {}) {
	const xScale = scaleBand().domain(['A']).range([0, 200]).padding(0.1)
	const yScale = scaleLinear().domain([0, 100]).range([200, 0])
	return createMockState({
		xScale,
		yScale,
		colors: new Map([['A', { fill: '#4e79a7', stroke: '#264653' }]]),
		geomData: () => rows,
		chartPreset: { opacity: { box: 0.5 } },
		setHovered: () => {},
		clearHovered: () => {},
		...overrides
	})
}

describe('Box.svelte outliers', () => {
	it('renders the box body group', () => {
		const state = boxState()
		const { container } = render(TestBox, { props: { state, x: 'cat', y: 'val' } })
		expect(container.querySelector('[data-plot-geom="box"]')).toBeTruthy()
	})

	it('renders one outlier circle per outlier value', () => {
		const state = boxState()
		const { container } = render(TestBox, { props: { state, x: 'cat', y: 'val' } })
		const dots = container.querySelectorAll('[data-plot-element="box-outlier"]')
		expect(dots.length).toBe(1)
	})

	it('renders no outlier circle when the row has none', () => {
		const rows = [{ cat: 'A', q1: 20, median: 40, q3: 60, iqr_min: 10, iqr_max: 80, outliers: [] }]
		const state = boxState(rows)
		const { container } = render(TestBox, { props: { state, x: 'cat', y: 'val' } })
		expect(container.querySelectorAll('[data-plot-element="box-outlier"]').length).toBe(0)
	})
})

describe('Box.svelte root-channel inheritance', () => {
	// Uses a REAL PlotState (not the mock) so the full flow runs end-to-end:
	// geom resolves channels from root → registerGeom → geomData → applyBoxStat →
	// buildBoxes → render. A mock stubs geomData and would hide a broken stat path
	// (the same blind spot that let the original NaN bug through).
	it('inherits root channels end-to-end so <Plot.Box> works without geom x/y', () => {
		const cars = [
			{ cls: 'A', v: 10 }, { cls: 'A', v: 20 }, { cls: 'A', v: 30 }, { cls: 'A', v: 40 },
			{ cls: 'B', v: 15 }, { cls: 'B', v: 25 }, { cls: 'B', v: 35 }, { cls: 'B', v: 45 }
		]
		const state = new PlotState({ data: cars, channels: { x: 'cls', y: 'v' }, width: 400, height: 300 })
		// No x/y on the geom — it must fall back to the root channels.
		const { container } = render(TestBox, { props: { state } })
		const bodies = container.querySelectorAll('[data-plot-element="box-body"]')
		// One box per class → applyBoxStat ran with the inherited channels (a clobbered
		// channel would return the 8 raw rows with no quartiles instead).
		expect(bodies.length).toBe(2)
		for (const b of bodies) {
			expect(Number.isNaN(Number(b.getAttribute('x')))).toBe(false)
			expect(Number.isNaN(Number(b.getAttribute('height')))).toBe(false)
		}
	})
})

describe('Box.svelte outlier interactivity', () => {
	it('labels each outlier with its value and is inspectable (not presentation)', () => {
		const state = boxState() // BOX_ROWS carries outliers: [95]
		const { container } = render(TestBox, { props: { state, x: 'cat', y: 'val' } })
		const dot = container.querySelector('[data-plot-element="box-outlier"]')
		expect(dot.getAttribute('role')).toBe('graphics-symbol')
		expect(dot.getAttribute('aria-label')).toContain('95')
	})

	it('calls setHovered with the outlier value on mouseenter', async () => {
		let hovered = null
		const state = boxState(BOX_ROWS, { setHovered: (d) => { hovered = d } })
		const { container } = render(TestBox, { props: { state, x: 'cat', y: 'val' } })
		const dot = container.querySelector('[data-plot-element="box-outlier"]')
		await fireEvent.mouseEnter(dot)
		expect(hovered).not.toBeNull()
		expect(hovered.value).toBe(95)
	})
})
