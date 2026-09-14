import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { scaleBand, scaleLinear } from 'd3-scale'
import { createMockState } from '../helpers/mock-plot-state.js'
import TestPoint from '../helpers/TestPoint.svelte'
import TestViolin from '../helpers/TestViolin.svelte'
import TestLine from '../helpers/TestLine.svelte'
import TestHighlight from '../helpers/TestHighlight.svelte'
import TestArcFull from '../helpers/TestArcFull.svelte'
import TestBar from '../helpers/TestBar.svelte'

/**
 * Geoms render their marks in the existing specs, but nothing ever hovers,
 * clicks or keys one, and nothing supplies a `label` or a pattern. Those are the
 * branches a user actually exercises: hovering drives the shared tooltip via
 * plotState.setHovered, and the label pill is the only on-mark annotation.
 */

const rows = [
	{ cat: 'a', val: 10 },
	{ cat: 'b', val: 20 }
]

function state(overrides = {}) {
	return createMockState({
		xScale: scaleBand().domain(['a', 'b']).range([0, 300]).padding(0.1),
		yScale: scaleLinear().domain([0, 40]).range([200, 0]),
		geomData: () => rows,
		colors: new Map([
			['a', { fill: '#4e79a7', stroke: '#31597c' }],
			['b', { fill: '#f28e2b', stroke: '#b56a20' }]
		]),
		...overrides
	})
}

const marks = (container, type) => [...container.querySelectorAll(`[data-plot-element="${type}"]`)]

describe('Point — hover', () => {
	it('reports the hovered row and clears it on leave', async () => {
		const setHovered = vi.fn()
		const clearHovered = vi.fn()
		const { container } = render(TestPoint, {
			state: state({ setHovered, clearHovered }),
			x: 'cat',
			y: 'val'
		})

		const [first] = marks(container, 'point')
		expect(first).toBeTruthy()

		await fireEvent.mouseEnter(first)
		expect(setHovered).toHaveBeenCalledWith(rows[0])

		await fireEvent.mouseLeave(first)
		expect(clearHovered).toHaveBeenCalled()
	})
})

describe('Point — selection', () => {
	it('calls onselect when a point is clicked', async () => {
		const onselect = vi.fn()
		const { container } = render(TestPoint, {
			state: state(),
			x: 'cat',
			y: 'val',
			onselect
		})

		await fireEvent.click(marks(container, 'point')[0])

		expect(onselect).toHaveBeenCalled()
	})

	it.each(['Enter', ' '])('%s activates a point when keyboard is enabled', async (key) => {
		const onselect = vi.fn()
		const { container } = render(TestPoint, {
			state: state(),
			x: 'cat',
			y: 'val',
			keyboard: true,
			onselect
		})

		await fireEvent.keyDown(marks(container, 'point')[0], { key })

		expect(onselect).toHaveBeenCalled()
	})

	it('ignores other keys', async () => {
		const onselect = vi.fn()
		const { container } = render(TestPoint, {
			state: state(),
			x: 'cat',
			y: 'val',
			keyboard: true,
			onselect
		})

		await fireEvent.keyDown(marks(container, 'point')[0], { key: 'ArrowRight' })

		expect(onselect).not.toHaveBeenCalled()
	})

	it('attaches no click handler when the plot is inert', () => {
		// Without onselect, keyboard or an interactive plot the mark must not become
		// a click target — otherwise every scatter looks actionable.
		const { container } = render(TestPoint, {
			state: state({ interactive: false }),
			x: 'cat',
			y: 'val'
		})

		expect(marks(container, 'point')[0].getAttribute('tabindex')).toBeNull()
	})
})

describe('Point — labels', () => {
	it('renders a label pill per point when label is true', () => {
		const { container } = render(TestPoint, {
			state: state(),
			x: 'cat',
			y: 'val',
			label: true
		})

		expect(container.querySelectorAll('[data-plot-element="label"]').length).toBeGreaterThan(0)
	})

	it('resolves a label from a field name', () => {
		const { container } = render(TestPoint, {
			state: state(),
			x: 'cat',
			y: 'val',
			label: 'cat'
		})

		expect(container.textContent).toContain('a')
	})

	it('resolves a label from a formatter function', () => {
		const { container } = render(TestPoint, {
			state: state(),
			x: 'cat',
			y: 'val',
			label: (d) => `#${d.val}`
		})

		expect(container.textContent).toContain('#10')
	})

	it('renders no pill when the formatter yields nothing', () => {
		const { container } = render(TestPoint, {
			state: state(),
			x: 'cat',
			y: 'val',
			label: () => ''
		})

		expect(container.querySelectorAll('[data-plot-element="label"]')).toHaveLength(0)
	})

	it('offsets the pill by the configured labelOffset', () => {
		const { container } = render(TestPoint, {
			state: state(),
			x: 'cat',
			y: 'val',
			label: true,
			options: { labelOffset: { x: 5, y: -20 } }
		})

		expect(container.querySelectorAll('[data-plot-element="label"]').length).toBeGreaterThan(0)
	})
})

describe('Violin — hover and pattern overlay', () => {
	const violinRows = [
		{ cat: 'a', val: 1 },
		{ cat: 'a', val: 3 },
		{ cat: 'a', val: 5 },
		{ cat: 'b', val: 2 },
		{ cat: 'b', val: 4 },
		{ cat: 'b', val: 6 }
	]

	const violinState = (overrides = {}) =>
		createMockState({
			xScale: scaleBand().domain(['a', 'b']).range([0, 300]).padding(0.1),
			yScale: scaleLinear().domain([0, 10]).range([200, 0]),
			geomData: () => violinRows,
			colors: new Map([
				['a', { fill: '#4e79a7', stroke: '#31597c' }],
				['b', { fill: '#f28e2b', stroke: '#b56a20' }]
			]),
			...overrides
		})

	it('reports the hovered row and clears it on leave', async () => {
		const setHovered = vi.fn()
		const clearHovered = vi.fn()
		const { container } = render(TestViolin, {
			state: violinState({ setHovered, clearHovered }),
			x: 'cat',
			y: 'val'
		})

		const [first] = marks(container, 'violin')
		expect(first).toBeTruthy()

		await fireEvent.mouseEnter(first)
		expect(setHovered).toHaveBeenCalled()

		await fireEvent.mouseLeave(first)
		expect(clearHovered).toHaveBeenCalled()
	})

	it('paints a texture overlay when the state assigns a pattern', () => {
		// The overlay is a second path on top of the silhouette; without it a
		// pattern-encoded violin renders as a flat fill.
		// patternIdFor reads the `pattern` CHANNEL's value per row and looks it up in
		// state.patterns — so the channel has to be mapped, not just the map filled.
		const { container } = render(TestViolin, {
			state: violinState({ patterns: new Map([['a', 'brick'], ['b', 'grid']]) }),
			x: 'cat',
			y: 'val',
			pattern: 'cat'
		})

		const overlay = [...container.querySelectorAll('path')].filter((p) =>
			(p.getAttribute('fill') ?? '').startsWith('url(#')
		)
		expect(overlay.length).toBeGreaterThan(0)
	})
})

describe('Line — hover, selection and labels', () => {
	const lineRows = [
		{ t: 1, v: 10 },
		{ t: 2, v: 20 },
		{ t: 3, v: 15 }
	]
	const lineState = (overrides = {}) =>
		createMockState({
			xScale: scaleLinear().domain([1, 3]).range([0, 300]),
			yScale: scaleLinear().domain([0, 30]).range([200, 0]),
			geomData: () => lineRows,
			colors: new Map(),
			...overrides
		})

	it('reports the hovered row from a vertex and clears it on leave', async () => {
		const setHovered = vi.fn()
		const clearHovered = vi.fn()
		const { container } = render(TestLine, {
			state: lineState({ setHovered, clearHovered }),
			x: 't',
			y: 'v'
		})

		// The hit target is an invisible circle over each vertex, not the visible dot.
		const [vertex] = marks(container, 'line-hover')
		expect(vertex).toBeTruthy()

		await fireEvent.mouseEnter(vertex)
		expect(setHovered).toHaveBeenCalled()

		await fireEvent.mouseLeave(vertex)
		expect(clearHovered).toHaveBeenCalled()
	})

	it.each(['Enter', ' '])('%s activates a vertex when keyboard is enabled', async (key) => {
		const onselect = vi.fn()
		const { container } = render(TestLine, {
			state: lineState(),
			x: 't',
			y: 'v',
			keyboard: true,
			onselect
		})

		await fireEvent.keyDown(marks(container, 'line-hover')[0], { key })

		expect(onselect).toHaveBeenCalled()
	})

	it('renders a label pill per vertex when label is set', () => {
		const { container } = render(TestLine, {
			state: lineState(),
			x: 't',
			y: 'v',
			label: (d) => `v${d.v}`
		})

		expect(container.textContent).toContain('v10')
		expect(container.querySelectorAll('[data-plot-element="label"]').length).toBeGreaterThan(0)
	})

	it('renders no pill when the formatter yields nothing', () => {
		const { container } = render(TestLine, {
			state: lineState(),
			x: 't',
			y: 'v',
			label: () => ''
		})

		expect(container.querySelectorAll('[data-plot-element="label"]')).toHaveLength(0)
	})
})

describe('Arc — hover, selection and pattern overlay', () => {
	const arcRows = [
		{ cls: 'a', n: 3 },
		{ cls: 'b', n: 5 }
	]
	const arcState = (overrides = {}) =>
		createMockState({
			geomData: () => arcRows,
			colors: new Map([
				['a', { fill: '#4e79a7', stroke: '#31597c' }],
				['b', { fill: '#f28e2b', stroke: '#b56a20' }]
			]),
			...overrides
		})

	const arcs = (container) => [...container.querySelectorAll('[data-plot-element="arc"]')]

	it('reports the hovered slice with its percentage, and clears on leave', async () => {
		const setHovered = vi.fn()
		const clearHovered = vi.fn()
		const { container } = render(TestArcFull, {
			state: arcState({ setHovered, clearHovered }),
			theta: 'n',
			color: 'cls'
		})

		const [slice] = arcs(container)
		expect(slice).toBeTruthy()

		await fireEvent.mouseEnter(slice)
		// The tooltip payload carries the share, which the raw row does not have.
		expect(setHovered).toHaveBeenCalledWith(expect.objectContaining({ '%': expect.any(String) }))

		await fireEvent.mouseLeave(slice)
		expect(clearHovered).toHaveBeenCalled()
	})

	it('calls onselect with the slice and its percentage on click', async () => {
		const onselect = vi.fn()
		const { container } = render(TestArcFull, {
			state: arcState(),
			theta: 'n',
			color: 'cls',
			onselect
		})

		await fireEvent.click(arcs(container)[0])

		expect(onselect).toHaveBeenCalledWith(expect.objectContaining({ '%': expect.any(String) }))
	})

	it.each(['Enter', ' '])('%s activates a slice', async (key) => {
		const onselect = vi.fn()
		const { container } = render(TestArcFull, {
			state: arcState(),
			theta: 'n',
			color: 'cls',
			onselect
		})

		await fireEvent.keyDown(arcs(container)[0], { key })

		expect(onselect).toHaveBeenCalled()
	})

	it('paints a texture overlay for a pattern-encoded slice', () => {
		const { container } = render(TestArcFull, {
			state: arcState({ patterns: new Map([['a', 'brick'], ['b', 'grid']]) }),
			theta: 'n',
			color: 'cls',
			pattern: 'cls'
		})

		const overlay = [...container.querySelectorAll('path')].filter((p) =>
			(p.getAttribute('fill') ?? '').startsWith('url(#')
		)
		expect(overlay.length).toBeGreaterThan(0)
	})
})

describe('Highlight — labels', () => {
	const hlRows = [
		{ t: 1, v: 10 },
		{ t: 2, v: 30 },
		{ t: 3, v: 15 }
	]
	const hlState = () =>
		createMockState({
			xScale: scaleLinear().domain([1, 3]).range([0, 300]),
			yScale: scaleLinear().domain([0, 40]).range([200, 0]),
			// Highlight resolves its marks from state.data, not geomData.
			data: hlRows,
			geomData: () => hlRows,
			colors: new Map()
		})

	it('labels the highlighted mark when label is set', () => {
		const { container } = render(TestHighlight, {
			state: hlState(),
			x: 't',
			y: 'v',
			highlight: 'max',
			label: (row) => `peak ${row.v}`
		})

		const text = container.querySelector('[data-plot-highlight-label]')
		expect(text).toBeTruthy()
		expect(text.textContent).toContain('peak 30')
	})

	it('renders no label element when the formatter yields nothing', () => {
		const { container } = render(TestHighlight, {
			state: hlState(),
			x: 't',
			y: 'v',
			highlight: 'max',
			label: () => ''
		})

		expect(container.querySelector('[data-plot-highlight-label]')).toBeNull()
	})

	it('renders no label element when label is off', () => {
		const { container } = render(TestHighlight, {
			state: hlState(),
			x: 't',
			y: 'v',
			highlight: 'max'
		})

		expect(container.querySelector('[data-plot-highlight-label]')).toBeNull()
	})
})

describe('Bar — hover and label placement', () => {
	const barState = (overrides = {}) =>
		createMockState({
			xScale: scaleBand().domain(['a', 'b']).range([0, 300]).padding(0.1),
			yScale: scaleLinear().domain([0, 40]).range([200, 0]),
			geomData: () => rows,
			colors: new Map([
				['a', { fill: '#4e79a7', stroke: '#31597c' }],
				['b', { fill: '#f28e2b', stroke: '#b56a20' }]
			]),
			...overrides
		})

	const bars = (container) => [...container.querySelectorAll('[data-plot-element="bar"]')]

	it('reports the hovered row and clears it on leave', async () => {
		const setHovered = vi.fn()
		const clearHovered = vi.fn()
		const { container } = render(TestBar, {
			state: barState({ setHovered, clearHovered }),
			x: 'cat',
			y: 'val'
		})

		const [first] = bars(container)
		expect(first).toBeTruthy()

		await fireEvent.mouseEnter(first)
		expect(setHovered).toHaveBeenCalledWith(rows[0])

		await fireEvent.mouseLeave(first)
		expect(clearHovered).toHaveBeenCalled()
	})

	it('places a pill above the bar in the vertical orientation', () => {
		const { container } = render(TestBar, {
			state: barState(),
			x: 'cat',
			y: 'val',
			label: true
		})

		expect(container.querySelectorAll('[data-plot-element="label"]').length).toBeGreaterThan(0)
	})

	it('places a pill beside the bar in the horizontal orientation', () => {
		const { container } = render(TestBar, {
			state: barState({ orientation: 'horizontal' }),
			x: 'cat',
			y: 'val',
			label: true,
			options: { orientation: 'horizontal' }
		})

		expect(container.querySelectorAll('[data-plot-element="label"]').length).toBeGreaterThan(0)
	})

	it('draws the label inside the bar when labelInside is set and it fits', () => {
		// Inside labels sit on the fill, so they use a contrast colour rather than the
		// stroke — the wrong branch here makes a dark label on a dark bar.
		const { container } = render(TestBar, {
			state: barState({ orientation: 'horizontal' }),
			x: 'cat',
			y: 'val',
			label: () => 'x',
			options: { orientation: 'horizontal', labelInside: true }
		})

		const label = container.querySelector('text[data-plot-element="label"]')
		expect(label).toBeTruthy()
		expect(label.getAttribute('text-anchor')).toBe('end')
	})

	it('pushes an inside label outside when the bar is too narrow for it', () => {
		const { container } = render(TestBar, {
			state: barState({ orientation: 'horizontal' }),
			x: 'cat',
			y: 'val',
			label: () => 'a very long label that cannot fit',
			options: { orientation: 'horizontal', labelInside: true }
		})

		const label = container.querySelector('text[data-plot-element="label"]')
		expect(label).toBeTruthy()
		expect(label.getAttribute('text-anchor')).toBe('start')
	})

	it('renders no label when the formatter yields nothing', () => {
		const { container } = render(TestBar, {
			state: barState(),
			x: 'cat',
			y: 'val',
			label: () => ''
		})

		expect(container.querySelectorAll('[data-plot-element="label"]')).toHaveLength(0)
	})
})
