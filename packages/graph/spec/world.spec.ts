/* The world view (#163, design step 3).
 *
 * A treemap over the containment tree: every box's area is what it CONTAINS, and only a fixed
 * number of levels is materialised at a time. That second part is the whole scaling story —
 * the cost of 1.18M nodes is in building them, not in packing them, so the layout refuses to
 * build what it is not showing.
 *
 * Asserted through GraphState: which boxes exist, where they sit, and how much area each got. */

import { describe, it, expect } from 'vitest'
import { GraphState } from '../src/GraphState.svelte.js'
import { CALL_FIELDS, measured, nestedPath } from './fixtures.js'

const FIELDS = { ...CALL_FIELDS, path: 'path', note: 'note', measures: 'm' }

const state = (config = {}) =>
	new GraphState({
		nodes: nestedPath.nodes,
		edges: nestedPath.edges,
		fields: FIELDS,
		layout: 'world',
		...config
	})

const boxes = (s: GraphState) => s.clusters.map((c) => c.name)
const areaOf = (box: { w?: number; h?: number }) => (box.w ?? 0) * (box.h ?? 0)

describe('world layout', () => {
	it('materialises two levels by default, not the whole tree', () => {
		// `parse` and `tokenize` are three deep. Building them to draw a two-level view is the
		// cost this layout exists to refuse.
		const s = state()

		expect(Object.keys(s.cards)).not.toContain('a')
		expect(Object.keys(s.cards)).not.toContain('b')
	})

	it('shows the focus’s children as boxes and their children inside', () => {
		const s = state()

		expect(boxes(s)).toContain('dbd')
		expect(boxes(s)).toContain('core')
	})

	it('goes deeper only when asked', () => {
		expect(Object.keys(state({ levels: 4 }).cards)).toContain('a')
	})

	it('scopes to a subtree, which is what drilling renders', () => {
		// The focus becomes the canvas; nothing outside it is built at all.
		const s = state({ focusPath: ['dbd', 'core'] })

		expect(boxes(s)).not.toContain('dbd')
		expect(Object.keys(s.cards)).toContain('c')
	})

	it('gives a bigger measure a bigger area', () => {
		const s = new GraphState({
			nodes: measured.nodes,
			edges: measured.edges,
			fields: FIELDS,
			layout: 'world',
			sizeBy: 'declarations',
			levels: 2
		})

		// parser 900, lexer 300, util 60
		expect(areaOf(s.cards.parser)).toBeGreaterThan(areaOf(s.cards.lexer))
		expect(areaOf(s.cards.lexer)).toBeGreaterThan(areaOf(s.cards.util))
	})

	it('keeps area roughly PROPORTIONAL, not merely ordered', () => {
		const s = new GraphState({
			nodes: measured.nodes,
			edges: measured.edges,
			fields: FIELDS,
			layout: 'world',
			sizeBy: 'declarations',
			levels: 2
		})
		const ratio = areaOf(s.cards.parser) / areaOf(s.cards.lexer)

		// 900 / 300 = 3. Padding and the minimum cell blur it; an order of magnitude out
		// would mean the area is not encoding the measure at all.
		expect(ratio).toBeGreaterThan(2)
		expect(ratio).toBeLessThan(4.5)
	})

	it('still gives a zero-measure node a clickable box', () => {
		// "Unknown" is normal in a partially-indexed graph. Exact-area treemapping would give
		// it nothing at all, which is indistinguishable from being missing.
		const s = new GraphState({
			nodes: measured.nodes,
			edges: measured.edges,
			fields: FIELDS,
			layout: 'world',
			sizeBy: 'declarations',
			levels: 2
		})

		expect(s.cards.bare.w).toBeGreaterThan(0)
		expect(s.cards.bare.h).toBeGreaterThan(0)
	})

	it('contains every child box inside its parent', () => {
		const s = state({ levels: 3 })
		const byName = new Map(s.clusters.map((c) => [c.name, c]))

		for (const cluster of s.clusters) {
			const parent = cluster.parent ? byName.get(cluster.parent) : undefined
			if (!parent) continue
			expect(cluster.x, cluster.name).toBeGreaterThanOrEqual(parent.x - 0.001)
			expect(cluster.y, cluster.name).toBeGreaterThanOrEqual(parent.y - 0.001)
			expect(cluster.x + (cluster.w ?? 0)).toBeLessThanOrEqual(parent.x + (parent.w ?? 0) + 0.001)
			expect(cluster.y + (cluster.h ?? 0)).toBeLessThanOrEqual(parent.y + (parent.h ?? 0) + 0.001)
		}
	})

	it('never overlaps two sibling boxes', () => {
		const s = state({ levels: 3 })
		const siblings = s.clusters.filter((c) => c.parent === 'dbd')

		for (let i = 0; i < siblings.length; i++) {
			for (let j = i + 1; j < siblings.length; j++) {
				const a = siblings[i]
				const b = siblings[j]
				const apart =
					a.x + (a.w ?? 0) <= b.x + 0.001 ||
					b.x + (b.w ?? 0) <= a.x + 0.001 ||
					a.y + (a.h ?? 0) <= b.y + 0.001 ||
					b.y + (b.h ?? 0) <= a.y + 0.001
				expect(apart, `${a.name} vs ${b.name}`).toBe(true)
			}
		}
	})

	it('fills the canvas it declares — a treemap has no gutters to spare', () => {
		// Top-level boxes are clusters AND cards: a root-level leaf has no children, so it is
		// a card. Counting only clusters measures half the canvas and passes for the wrong
		// reason — which it did, until an even-split fallback made every box equal.
		const s = state()
		const top = [
			...s.clusters.filter((c) => (c.depth ?? 0) === 0),
			...Object.values(s.cards).filter((c) => c.groupIndex !== undefined)
		]
		const used = s.clusters
			.filter((c) => (c.depth ?? 0) === 0)
			.reduce((total, c) => total + areaOf(c), 0)
		const leaves = Object.values(s.cards)
			.filter((c) => !s.clusters.some((cl) => cl.name === c.node.label))
			.reduce((total, c) => total + c.w * c.h, 0)

		expect(top.length).toBeGreaterThan(0)
		expect((used + leaves) / (s.size.w * s.size.h)).toBeGreaterThan(0.8)
	})

	it('encodes the measure even when the caller never set one', () => {
		// `sizeBy` defaults to `degree` package-wide. A tree that did not understand it summed
		// every node to zero, and a tree of zeroes fell through to an even split — rendering a
		// 27:1 ratio as 1:1 with no error anywhere.
		const s = state()
		const dbd = s.clusters.find((c) => c.name === 'dbd')
		const orphan = Object.values(s.cards).find((c) => c.node.label === 'orphan')

		expect(areaOf(dbd!)).toBeGreaterThan((orphan!.w * orphan!.h) * 2)
	})

	it('keeps boxes squarish rather than slivers', () => {
		// The point of SQUARIFIED. A naive slice-and-dice gives 1px-wide boxes that cannot
		// hold a label, which is what makes drill-down unnavigable.
		const s = state({ levels: 3 })

		for (const c of s.clusters) {
			const aspect = (c.w ?? 1) / (c.h ?? 1)
			expect(aspect, c.name).toBeGreaterThan(0.06)
			expect(aspect, c.name).toBeLessThan(16)
		}
	})

	it('reports no routed edges — containment is the relationship here', () => {
		// 4.08M edges cannot be drawn and should not be; cross-container aggregation is its
		// own design.
		expect(state().routedEdges).toEqual([])
	})

	it('captions a box with its MEASURE, not its child count', () => {
		// A number beside a box reads as the thing driving its size. Showing the child count
		// where AREA encodes a measure is actively misleading: `components · 63` was 63 files
		// in a box sized by 63 declarations, and the two matching was a coincidence that made
		// the label look self-consistent while the neighbouring boxes did not add up.
		const s = state({ sizeBy: 'weight' })
		const dbd = s.clusters.find((c) => c.name === 'dbd')

		expect(dbd?.caption).toBe('135')
		expect(dbd?.count).not.toBe(135)
	})

	it('captions by whatever measure is active, not one fixed field', () => {
		// The default is `degree`, so the caption tracks that rather than a weight nobody asked
		// for — the number and the area always agree, whichever measure is driving them.
		const s = state()

		expect(s.clusters.find((c) => c.name === 'dbd')?.caption).toBe('6')
	})

	it('compacts a large caption so it fits a label strip', () => {
		const big = [
			{ id: 'a', label: 'a', path: ['p', 'a'], weight: 1_500 },
			{ id: 'b', label: 'b', path: ['p', 'b'], weight: 1_500 }
		]
		const s = new GraphState({
			nodes: big,
			edges: [],
			fields: FIELDS,
			layout: 'world',
			sizeBy: 'weight'
		})

		expect(s.clusters.find((c) => c.name === 'p')?.caption).toBe('3.0k')
	})

	it('compacts millions too — a real index counts in them', () => {
		const huge = [
			{ id: 'a', label: 'a', path: ['p', 'a'], weight: 2_400_000 },
			{ id: 'b', label: 'b', path: ['p', 'b'], weight: 100_000 }
		]
		const s = new GraphState({
			nodes: huge,
			edges: [],
			fields: FIELDS,
			layout: 'world',
			sizeBy: 'weight'
		})

		expect(s.clusters.find((c) => c.name === 'p')?.caption).toBe('2.5M')
	})

	it('is deterministic', () => {
		expect(state().cards).toEqual(state().cards)
	})

	it('handles an unknown focusPath by rendering nothing rather than throwing', () => {
		const s = state({ focusPath: ['nope', 'missing'] })

		expect(s.cards).toEqual({})
		expect(s.clusters).toEqual([])
	})

	it('stops nesting when a box is smaller than its own chrome', () => {
		// Below border + label there is no content area left, only a frame around nothing.
		// Deep enough nesting reaches that, and it must stop rather than emit inverted boxes.
		const deep = Array.from({ length: 12 }, (_, i) => ({
			id: `n${i}`,
			label: `n${i}`,
			path: Array.from({ length: i + 1 }, (_, d) => `L${d}`).concat(`n${i}`),
			weight: 1
		}))
		const s = new GraphState({
			nodes: deep,
			edges: [],
			fields: FIELDS,
			layout: 'world',
			levels: 12
		})

		for (const c of s.clusters) {
			expect(c.w, c.name).toBeGreaterThanOrEqual(0)
			expect(c.h, c.name).toBeGreaterThanOrEqual(0)
		}
	})

	it('exposes the drill settings it was configured with', () => {
		const s = state({ focusPath: ['dbd'], levels: 3 })

		expect([s.focusPath, s.levels]).toEqual([['dbd'], 3])
	})

	it('floors a nonsense level count at one', () => {
		expect(state({ levels: 0 }).clusters.length + Object.keys(state({ levels: 0 }).cards).length)
			.toBeGreaterThan(0)
	})

	it('handles an empty model', () => {
		const s = new GraphState({ nodes: [], edges: [], fields: FIELDS, layout: 'world' })

		expect(s.clusters).toEqual([])
		expect(s.size).toEqual({ w: 0, h: 0 })
	})
})
