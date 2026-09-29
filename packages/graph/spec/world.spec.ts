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
/** A leaf box by the node it is. Every box is a cluster; only a leaf carries `nodeId`. */
const leafOf = (s: GraphState, nodeId: string) => s.clusters.find((c) => c.nodeId === nodeId)

describe('world layout', () => {
	it('materialises two levels by default, not the whole tree', () => {
		// `parse` and `tokenize` are three deep. Building them to draw a two-level view is the
		// cost this layout exists to refuse.
		const s = state()

		expect(leafOf(s, 'a')).toBeUndefined()
		expect(leafOf(s, 'b')).toBeUndefined()
	})

	it('shows the focus’s children as boxes and their children inside', () => {
		const s = state()

		expect(boxes(s)).toContain('dbd')
		expect(boxes(s)).toContain('core')
	})

	it('goes deeper only when asked', () => {
		expect(leafOf(state({ levels: 4 }), 'a')).toBeDefined()
	})

	it('scopes to a subtree, which is what drilling renders', () => {
		// The focus becomes the canvas; nothing outside it is built at all.
		const s = state({ focusPath: ['dbd', 'core'] })

		expect(boxes(s)).not.toContain('dbd')
		expect(leafOf(s, 'c')).toBeDefined()
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
		expect(areaOf(leafOf(s, 'parser')!)).toBeGreaterThan(areaOf(leafOf(s, 'lexer')!))
		expect(areaOf(leafOf(s, 'lexer')!)).toBeGreaterThan(areaOf(leafOf(s, 'util')!))
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
		const ratio = areaOf(leafOf(s, 'parser')!) / areaOf(leafOf(s, 'lexer')!)

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

		expect(leafOf(s, 'bare')?.w).toBeGreaterThan(0)
		expect(leafOf(s, 'bare')?.h).toBeGreaterThan(0)
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
		// Every top-level box counts, leaf or region alike. Missing half of them measured half
		// the canvas and passed for the wrong reason — which it did, until an even-split
		// fallback made every box equal.
		const s = state()
		const top = s.clusters.filter((c) => (c.depth ?? 0) === 0)
		const used = top.reduce((total, c) => total + areaOf(c), 0)

		expect(top.length).toBeGreaterThan(0)
		expect(used / (s.size.w * s.size.h)).toBeGreaterThan(0.8)
	})

	it('encodes the measure even when the caller never set one', () => {
		// `sizeBy` defaults to `degree` package-wide. A tree that did not understand it summed
		// every node to zero, and a tree of zeroes fell through to an even split — rendering a
		// 27:1 ratio as 1:1 with no error anywhere.
		const s = state()
		const dbd = s.clusters.find((c) => c.name === 'dbd')

		expect(areaOf(dbd!)).toBeGreaterThan(areaOf(leafOf(s, 'e')!) * 2)
	})

	describe('the floor under a zero measure', () => {
		/* "Unmeasured" is a normal state in a partially-indexed graph, so a zero-measure node
		 * keeps a box. The floor that guarantees it has to be relative to an EQUAL SHARE, not to
		 * the total: a per-child floor of `total * k` sums to `n * k * total`, which is
		 * negligible at two children and swamps the whole canvas at 470 — backwards from what
		 * real data needs. Against the equal share it caps at `k` whatever n is. */

		it('gives a zero-measure box a legible size, not a 2px sliver', () => {
			// `orphan` has no edges, so it measures 0 under the default `degree`. It rendered
			// 2px wide beside `dbd` — a box in the data and a hairline on screen.
			const orphan = leafOf(state(), 'e')!
			const aspect = orphan.w! / orphan.h!

			expect(Math.min(orphan.w!, orphan.h!)).toBeGreaterThan(20)
			expect(aspect).toBeGreaterThan(0.06)
		})

		it('caps total distortion regardless of how many children there are', () => {
			// 470 zero-measure siblings — the size of the real codebase dataset — must not crowd
			// out the one node that has a measure. The old floor gave them 0.002 * total EACH,
			// so together they took almost the whole canvas and proportion stopped reading.
			const many = [
				{ id: 'big', label: 'big', path: ['r', 'big'], weight: 1000 },
				...Array.from({ length: 470 }, (_, i) => ({
					id: `z${i}`,
					label: `z${i}`,
					path: ['r', `z${i}`],
					weight: 0
				}))
			]
			const s = new GraphState({
				nodes: many,
				edges: [],
				fields: FIELDS,
				layout: 'world',
				sizeBy: 'weight',
				levels: 2
			})
			const big = areaOf(leafOf(s, 'big')!)
			const zeros = Array.from({ length: 470 }, (_, i) => areaOf(leafOf(s, `z${i}`)!))
			const total = big + zeros.reduce((sum, a) => sum + a, 0)

			// The floors are a minority share of the canvas, so proportion still reads.
			expect(big / total).toBeGreaterThan(0.8)
		})
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
		expect(state().clusters).toEqual(state().clusters)
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
		expect(state({ levels: 0 }).clusters.length).toBeGreaterThan(0)
	})

	it('handles an empty model', () => {
		const s = new GraphState({ nodes: [], edges: [], fields: FIELDS, layout: 'world' })

		expect(s.clusters).toEqual([])
		expect(s.size).toEqual({ w: 0, h: 0 })
	})

	describe('one box structure, whatever the depth', () => {
		/* A treemap is a hierarchy of ONE thing: a box with a label and an area. Emitting a leaf
		 * as a node CARD — icon, kind tag, row count — and a container as a label box put two
		 * visual structures in one nesting, and the card's furniture was meaningless here: a
		 * codebase module has no rows, so every leaf rendered a literal `0` beside its name. */

		it('emits no cards at all — every box is a cluster', () => {
			const s = state({ levels: 3 })

			expect(s.cards).toEqual({})
			expect(s.clusters.length).toBeGreaterThan(3)
		})

		it('gives a leaf box the same fields a container box has', () => {
			const s = state({ levels: 4 })
			const leaf = s.clusters.find((c) => c.name === 'parse')

			expect(leaf).toBeDefined()
			expect(leaf?.caption).toBeDefined()
			expect(leaf?.w).toBeGreaterThan(0)
			expect(leaf?.h).toBeGreaterThan(0)
		})

		it('keeps a leaf selectable by carrying its node id and kind', () => {
			// Uniform structure must not cost identity: the box is still the thing itself, so it
			// still answers a click and still colours by what it is.
			const s = new GraphState({
				nodes: [
					{ id: 'a', label: 'parse', kind: 'module', path: ['dbd', 'parse'], weight: 40 },
					{ id: 'b', label: 'emit', kind: 'module', path: ['dbd', 'emit'], weight: 10 }
				],
				edges: [],
				fields: FIELDS,
				layout: 'world',
				sizeBy: 'weight'
			})
			const leaf = s.clusters.find((c) => c.name === 'parse')

			expect(leaf?.nodeId).toBe('a')
			expect(leaf?.kind).toBe('module')
		})

		it('leaves nodeId unset on a container, which is not a node', () => {
			// A synthesised container has nothing to select — `dbd` is implied by the paths under
			// it and exists in no `nodes` array.
			expect(state().clusters.find((c) => c.name === 'dbd')?.nodeId).toBeUndefined()
		})

		it('captions a leaf with its measure, exactly as it captions a container', () => {
			const s = new GraphState({
				nodes: measured.nodes,
				edges: measured.edges,
				fields: FIELDS,
				layout: 'world',
				sizeBy: 'declarations',
				levels: 2
			})

			expect(s.clusters.find((c) => c.name === 'parser')?.caption).toBe('900')
		})
	})
})
