/* The structure view — a codebase as a radial dendrogram with its calls bundled through it.
 *
 * The layout `CallTree` could not be: a call graph's own spanning tree has hundreds of roots
 * over a real repo, so capping its depth prunes almost nothing and the rim is a grey smear.
 * Containment is a real tree with one root, which is what makes "two levels, then drill" mean
 * something. Asserted through GraphState, as every other layout spec is.
 */

import { describe, it, expect } from 'vitest'
import { GraphState } from '../../src/GraphState.svelte.js'

const FIELDS = { path: 'path' }

/**
 * Two crates, two modules each, two files each.
 *
 * Every module has TWO children on purpose: `buildTree` folds a single-child wrapper, so a
 * module with one file disappears from the tree and its band with it. That is correct
 * behaviour, and it makes a one-file-per-module fixture test a shape the layout never sees.
 */
const REPO = [
	{ id: 'a1', label: 'parse', path: ['repo', 'core', 'lexer', 'parse'] },
	{ id: 'a2', label: 'token', path: ['repo', 'core', 'lexer', 'token'] },
	{ id: 'b1', label: 'plan', path: ['repo', 'core', 'apply', 'plan'] },
	{ id: 'b2', label: 'diff', path: ['repo', 'core', 'apply', 'diff'] },
	{ id: 'c1', label: 'render', path: ['repo', 'site', 'ui', 'render'] },
	{ id: 'c2', label: 'theme', path: ['repo', 'site', 'ui', 'theme'] },
	{ id: 'd1', label: 'guide', path: ['repo', 'site', 'docs', 'guide'] },
	{ id: 'd2', label: 'intro', path: ['repo', 'site', 'docs', 'intro'] }
]

/**
 * Focused past the single repo root and cut at the FILE level, which is what most of these
 * cases are about. `levels` decides what sits on the rim — 1 is crates, 3 is files — so a
 * test about files has to say so rather than lean on the default.
 */
const state = (edges: unknown[] = [], config = {}) =>
	new GraphState({
		nodes: REPO,
		edges,
		fields: FIELDS,
		layout: 'structure',
		focusPath: ['repo'],
		levels: 3,
		...config
	})

const centreOf = (s: GraphState) => ({ x: s.size.w / 2, y: s.size.h / 2 })
const radiusOf = (s: GraphState, id: string) => {
	const c = s.cards[id]
	const m = centreOf(s)

	return Math.hypot(c.x + c.w / 2 - m.x, c.y + c.h / 2 - m.y)
}

describe('structure layout', () => {
	describe('the hierarchy is CONTAINMENT, not the call graph', () => {
		it('places a leaf for every module', () => {
			expect(Object.keys(state().cards).sort()).toEqual([
				'a1',
				'a2',
				'b1',
				'b2',
				'c1',
				'c2',
				'd1',
				'd2'
			])
		})

		it('puts every leaf on ONE rim, so leaves are comparable', () => {
			// The dendrogram property. Radius carries depth everywhere else; here it is fixed so
			// the rim can hold labels and the angle does the separating.
			const s = state()
			const radii = Object.keys(s.cards).map((id) => radiusOf(s, id))

			for (const r of radii) expect(r).toBeCloseTo(radii[0], 3)
		})

		it('ignores the call edges when placing — they are drawn ON the tree', () => {
			// The whole difference from `CallTree`. Adding calls must not move anything.
			const without = state()
			const withCalls = state([
				{ source: 'a1', target: 'c1' },
				{ source: 'b1', target: 'a2' }
			])

			// Compared at the CENTRE: a dot is sized by degree, so adding calls legitimately
			// changes its width — what must not move is where it sits.
			const centre = (g: GraphState, id: string) => ({
				x: g.cards[id].x + g.cards[id].w / 2,
				y: g.cards[id].y + g.cards[id].h / 2
			})

			expect(centre(withCalls, 'a1').x).toBeCloseTo(centre(without, 'a1').x, 5)
			expect(centre(withCalls, 'a1').y).toBeCloseTo(centre(without, 'a1').y, 5)
		})

		it('keeps a subtree contiguous on the rim', () => {
			// What makes the bands drawable at all, and what makes a bundle follow one arc
			// rather than crossing the circle twice.
			const s = state()
			const angle = (id: string) => {
				const c = s.cards[id]
				const m = centreOf(s)

				return Math.atan2(c.x + c.w / 2 - m.x, -(c.y + c.h / 2 - m.y))
			}
			const core = [angle('a1'), angle('a2'), angle('b1'), angle('b2')].sort((x, y) => x - y)
			const site = [angle('c1'), angle('c2'), angle('d1'), angle('d2')].sort((x, y) => x - y)

			// No `site` leaf falls between two `core` leaves.
			for (const s2 of site) {
				expect(s2 < core[0] || s2 > core[core.length - 1]).toBe(true)
			}
		})
	})

	describe('ancestor bands', () => {
		it('draws a band per ancestor level, as a wedge', () => {
			const s = state()

			expect(s.clusters.length).toBeGreaterThan(0)
			for (const band of s.clusters) expect(band.wedge).toBeDefined()
		})

		it('puts the bands OUTSIDE the rim, where the annotation belongs', () => {
			const s = state()
			const rim = radiusOf(s, 'a1')

			for (const band of s.clusters) expect(band.wedge!.r0).toBeGreaterThan(rim)
		})

		it('nests a deeper band outside a shallower one', () => {
			// Reading outward is reading down the tree, which is the opposite of a sunburst and
			// is what lets the leaf labels sit against the rim.
			const s = state([], { levels: 3 })
			const crate = s.clusters.find((c) => c.name === 'core')!
			const mod = s.clusters.find((c) => c.name === 'lexer')!

			expect(mod.wedge!.r0).toBeGreaterThan(crate.wedge!.r0)
		})

		it('spans a band across exactly its own leaves', () => {
			const s = state()
			const core = s.clusters.find((c) => c.name === 'core')!
			const site = s.clusters.find((c) => c.name === 'site')!

			expect(core.wedge!.a1).toBeLessThanOrEqual(site.wedge!.a0 + 0.001)
		})

		it('puts the crates themselves on the rim at one level, with no bands', () => {
			// The readable end of the control: a dozen boxes you can name, rather than every
			// file at a fraction of a degree. At one level the leaves ARE the regions, so
			// there is nothing left for a band to annotate.
			const s = state([], { levels: 1 })

			expect(Object.keys(s.cards).sort()).toEqual(['repo/core', 'repo/site'])
			expect(s.clusters).toEqual([])
		})

		it('puts the modules on the rim at two, with the crates as the one band', () => {
			const s = state([], { levels: 2 })

			expect(Object.keys(s.cards).length).toBe(4)
			expect(s.clusters.map((c) => c.name).sort()).toEqual(['core', 'site'])
		})

		it('counts levels from the FOCUS, so drilling does not change what one level means', () => {
			// Unfocused, one level is the repo itself — everything sits under a single root.
			const s = new GraphState({
				nodes: REPO,
				edges: [],
				fields: FIELDS,
				layout: 'structure',
				levels: 1
			})

			expect(Object.keys(s.cards)).toEqual(['repo'])
		})

		it('keys two same-named bands apart by their parent', () => {
			// Two crates can each hold a `lib`. `clusterKey` is depth:parent:name, so without the
			// parent that is a duplicate key — Svelte throws and the whole render aborts, which
			// looks like the bands silently not working rather than like an error.
			const s = new GraphState({
				// Two modules per crate, or `buildTree` folds the single-child crate away and the
				// two `lib`s merge into one node — which would make this pass for the wrong
				// reason, by never producing the collision it is about.
				nodes: [
					{ id: 'p', label: 'p', path: ['r', 'one', 'lib', 'p'] },
					{ id: 'q', label: 'q', path: ['r', 'one', 'lib', 'q'] },
					{ id: 'p2', label: 'p2', path: ['r', 'one', 'app', 'p2'] },
					{ id: 'q2', label: 'q2', path: ['r', 'one', 'app', 'q2'] },
					{ id: 'x', label: 'x', path: ['r', 'two', 'lib', 'x'] },
					{ id: 'y', label: 'y', path: ['r', 'two', 'lib', 'y'] },
					{ id: 'x2', label: 'x2', path: ['r', 'two', 'web', 'x2'] },
					{ id: 'y2', label: 'y2', path: ['r', 'two', 'web', 'y2'] }
				],
				edges: [],
				fields: FIELDS,
				layout: 'structure',
				focusPath: ['r'],
				levels: 3
			})
			const libs = s.clusters.filter((c) => c.name === 'lib')

			expect(libs).toHaveLength(2)
			expect(new Set(libs.map((c) => s.clusterKey(c))).size).toBe(2)
		})

		it('captions a band with how many leaves it holds', () => {
			expect(state().clusters.find((c) => c.name === 'core')?.caption).toBe('4')
		})
	})

	describe('rim labels', () => {
		/* The half of "readable" the depth control cannot fix on its own: a label lying flat on
		 * a circle either overlaps its neighbours or reads upside down on the left. */

		it('orients every leaf label tangentially', () => {
			const s = state()

			for (const card of Object.values(s.cards)) {
				expect(card.labelAngle, card.node.label).toBeTypeOf('number')
			}
		})

		it('flips through the left half, so nothing reads upside down', () => {
			// Two leaves on opposite sides must not both point the same way round.
			const s = state()
			const sides = new Set(Object.values(s.cards).map((c) => c.labelSide))

			expect(sides).toEqual(new Set(['start', 'end']))
		})

		it('runs the label away from the diagram on each side', () => {
			const s = state()
			const cards = Object.values(s.cards)
			const right = cards.find((c) => c.labelSide === 'start')!
			const left = cards.find((c) => c.labelSide === 'end')!

			// Rotated back the other way on the left, which is what `end` tells the renderer.
			expect(Math.abs(right.labelAngle! - left.labelAngle!)).toBeGreaterThan(0)
		})
	})

	describe('bundled edges', () => {
		it('builds its own path, since the shape needs the whole tree route', () => {
			const s = state([{ source: 'a1', target: 'c1' }])

			expect(s.edgePath(s.routedEdges[0]).length).toBeGreaterThan(20)
		})

		it('starts and ends at the two leaves, whatever the route between', () => {
			const s = state([{ source: 'a1', target: 'c1' }])
			const [edge] = s.routedEdges

			expect(edge.x1).toBeCloseTo(s.cards.a1.x + s.cards.a1.w / 2, 3)
			expect(edge.y2).toBeCloseTo(s.cards.c1.y + s.cards.c1.h / 2, 3)
		})

		it('bows toward the centre when bundled, and not when straight', () => {
			const bundled = state([{ source: 'a1', target: 'c1' }], { bundleTension: 0.85 })
			const straight = state([{ source: 'a1', target: 'c1' }], { bundleTension: 0 })

			expect(bundled.edgePath(bundled.routedEdges[0])).not.toBe(
				straight.edgePath(straight.routedEdges[0])
			)
		})

		it('classifies an edge by how far it travels in the TREE', () => {
			// `local` stays in one module, `crate` crosses modules, `cross` leaves the package —
			// which is what a reader filters on, and a different question from raw degree.
			const s = state([
				{ source: 'a1', target: 'a2' },
				{ source: 'a1', target: 'b1' },
				{ source: 'a1', target: 'c1' }
			])

			expect(s.routedEdges.map((e) => e.relation)).toEqual(['local', 'crate', 'cross'])
		})

		it('keeps a producer’s own verb rather than overwriting it', () => {
			const s = state([{ source: 'a1', target: 'c1', relation: 'reads' }])

			expect(s.routedEdges[0].relation).toBe('reads')
		})

		it('drops a self-call, which has no route through the tree', () => {
			expect(state([{ source: 'a1', target: 'a1' }]).routedEdges).toHaveLength(0)
		})

		it('drops an edge whose far end is not in the tree', () => {
			expect(state([{ source: 'a1', target: 'nope' }]).routedEdges).toHaveLength(0)
		})
	})

	describe('drilling and the usual contracts', () => {
		it('collapses an intra-region call into a self-link and drops it', () => {
			// The aggregation that makes a cut view readable: at crate level, a call between two
			// files in the same crate is not a line between two boxes — it is inside one. Only
			// calls that actually cross a boundary survive.
			const s = state([{ source: 'a1', target: 'a2' }], { levels: 1 })

			expect(s.routedEdges).toHaveLength(0)
		})

		it('keeps a call that crosses the cut', () => {
			const s = state([{ source: 'a1', target: 'c1' }], { levels: 1 })

			expect(s.routedEdges).toHaveLength(1)
			expect([s.routedEdges[0].fromKey, s.routedEdges[0].toKey].sort()).toEqual(['a1', 'c1'])
		})

		it('scopes the canvas to a subtree', () => {
			const s = state([], { focusPath: ['repo', 'core'], levels: 2 })

			expect(Object.keys(s.cards).sort()).toEqual(['a1', 'a2', 'b1', 'b2'])
		})

		it('keeps every card inside the canvas it reports', () => {
			const s = state()

			for (const card of Object.values(s.cards)) {
				expect(card.x).toBeGreaterThanOrEqual(0)
				expect(card.y).toBeGreaterThanOrEqual(0)
				expect(card.x + card.w).toBeLessThanOrEqual(s.size.w)
				expect(card.y + card.h).toBeLessThanOrEqual(s.size.h)
			}
		})

		it('is deterministic', () => {
			expect(state().cards).toEqual(state().cards)
		})

		it('handles an empty model', () => {
			const s = new GraphState({ nodes: [], edges: [], fields: FIELDS, layout: 'structure' })

			expect(s.clusters).toEqual([])
			expect(s.size).toEqual({ w: 0, h: 0 })
		})

		it('handles an unknown focusPath without throwing', () => {
			expect(state([], { focusPath: ['nope'] }).cards).toEqual({})
		})

		it('handles nodes with no path at all', () => {
			// They sit at the root, which is a legitimate shape — not every node in a graph
			// carries a containment path.
			const s = new GraphState({
				nodes: [{ id: 'x', label: 'x' }, { id: 'y', label: 'y' }],
				edges: [],
				fields: FIELDS,
				layout: 'structure'
			})

			expect(Object.keys(s.cards).sort()).toEqual(['x', 'y'])
		})
	})
})
