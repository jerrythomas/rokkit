import { describe, it, expect } from 'vitest'
import { points } from '../../src/layout/points.js'
/** Mirrors the layout's own CANVAS_PAD — the outer margin is margin, not wasted space. */
const CANVAS_PAD = 60

import { normalizeGraph } from '../../src/model/normalize.js'
import type { GraphFields } from '../../src/types.js'

const FIELDS: GraphFields = {
	id: 'key',
	label: 'key',
	group: 'team',
	rows: 'endpoints',
	rowName: 'label',
	source: 'caller',
	target: 'callee'
}

/** `hub` is deliberately the most connected node in its group. */
const NODES = [
	{ key: 'a.hub', team: 'a', endpoints: [{ label: 'x' }] },
	{ key: 'a.leaf1', team: 'a', endpoints: [] },
	{ key: 'a.leaf2', team: 'a', endpoints: [] },
	{ key: 'b.one', team: 'b', endpoints: [] },
	{ key: 'b.two', team: 'b', endpoints: [] }
]

const EDGES = [
	{ caller: 'a.leaf1', callee: 'a.hub' },
	{ caller: 'a.leaf2', callee: 'a.hub' },
	{ caller: 'b.one', callee: 'a.hub' },
	{ caller: 'b.two', callee: 'b.one' }
]

const model = () => normalizeGraph(NODES, EDGES, FIELDS)

/** A spread of degrees across ten groups — the shape a real code index has. */
const denseModel = (n: number) => {
	const nodes = Array.from({ length: n }, (_, i) => ({
		key: `t${i % 10}.n${i}`,
		team: `t${i % 10}`,
		endpoints: []
	}))
	const edges = Array.from({ length: n * 2 }, (_, i) => ({
		caller: `t${i % 10}.n${i % n}`,
		callee: `t${(i + 3) % 10}.n${(i * 7) % n}`
	}))
	return normalizeGraph(nodes, edges, FIELDS)
}

describe('points layout', () => {
	it('places every node', () => {
		expect(Object.keys(points(model(), {})).length).toBeGreaterThan(0)
		expect(Object.keys(points(model(), {}).cards).sort()).toEqual([
			'a.hub',
			'a.leaf1',
			'a.leaf2',
			'b.one',
			'b.two'
		])
	})

	it('renders a node as a wide rect, not a card and not a square', () => {
		// 2:1 shelves without wasting the band under each node the way a square does.
		const card = points(model(), {}).cards['a.leaf1']

		expect(card.w / card.h).toBeCloseTo(2, 5)
		expect(card.vis).toEqual([])
	})

	it('fills most of the canvas it declares', () => {
		// The defect this layout was rewritten for. Spiral-packed discs declared a 607x595
		// world for 362x364 of actual node ink — 36% — because one spiral step sized by the
		// LARGEST dot was applied to every ring, and a circular cluster throws away 21% of its
		// bounding box before anything is placed. Fit-to-container then frames the emptiness,
		// so the diagram opens further out than its content warrants and still clips.
		// Measured at a realistic size. On a 5-node model a group's label strip and padding
		// (66px) legitimately exceed its 58px of ink, so the ratio there says nothing about
		// packing; at 300 nodes the chrome amortises and the packing is what is left.
		const result = points(denseModel(300), {})
		const cards = Object.values(result.cards)
		const x0 = Math.min(...cards.map((c) => c.x))
		const y0 = Math.min(...cards.map((c) => c.y))
		const x1 = Math.max(...cards.map((c) => c.x + c.w))
		const y1 = Math.max(...cards.map((c) => c.y + c.h))

		// Measured against the canvas minus its outer padding, which is margin, not waste.
		const inner = (result.size.w - CANVAS_PAD * 2) * (result.size.h - CANVAS_PAD * 2)
		const spanned = (x1 - x0) * (y1 - y0)

		expect(spanned / inner).toBeGreaterThan(0.75)
	})

	it('packs a group far tighter than one step sized for its biggest node', () => {
		// The concrete regression: one hub plus two leaves used to produce a 238px disc.
		const cluster = points(model(), {}).clusters.find((c) => c.name === 'a')

		expect(cluster?.w).toBeLessThan(238)
	})

	it('sizes a dot by degree, so a hub is visibly bigger than a leaf', () => {
		const cards = points(model(), {}).cards

		expect(cards['a.hub'].w).toBeGreaterThan(cards['a.leaf2'].w)
	})

	it('scales by AREA rather than radius, so ten edges reads as ten', () => {
		// A radius-proportional scale would make a 4x-degree node 4x wide and 16x the area,
		// which overstates it badly. sqrt keeps area proportional to degree.
		const cards = points(model(), {}).cards
		const hubDegree = 3
		const leafDegree = 1
		const ratio = cards['a.hub'].w / cards['a.leaf2'].w

		expect(ratio).toBeLessThan(hubDegree / leafDegree)
	})

	it('reports one cluster per group', () => {
		expect(points(model(), {}).clusters.map((c) => c.name).sort()).toEqual(['a', 'b'])
	})

	it('keeps each node inside its own group cluster', () => {
		const result = points(model(), {})

		for (const cluster of result.clusters) {
			for (const node of cluster.list) {
				const card = result.cards[node.id]
				expect(card.x, node.id).toBeGreaterThanOrEqual(cluster.x - card.w)
				expect(card.x, node.id).toBeLessThanOrEqual(cluster.x + (cluster.w ?? 0))
			}
		}
	})

	it('never overlaps two nodes', () => {
		// Shelf packing places by arithmetic with no collision test, so this is the assertion
		// that the shelf wrap and the gap were chosen correctly rather than by eye. Axis
		// aligned, because the nodes are rects — the old circle-distance form would pass on
		// rects that plainly overlap at their corners.
		const result = points(denseModel(240), {})
		const placed = Object.values(result.cards)

		for (let i = 0; i < placed.length; i++) {
			for (let j = i + 1; j < placed.length; j++) {
				const a = placed[i]
				const b = placed[j]
				const apart =
					a.x + a.w <= b.x + 0.001 ||
					b.x + b.w <= a.x + 0.001 ||
					a.y + a.h <= b.y + 0.001 ||
					b.y + b.h <= a.y + 0.001
				expect(apart, `${a.node.id} vs ${b.node.id}`).toBe(true)
			}
		}
	})

	it('assigns groupIndex alphabetically, not by packed size', () => {
		// The grid orders clusters biggest-first, but colour must stay put when the data
		// changes size — the same stability rule resolveGroupStyles follows.
		const byName = new Map(points(model(), {}).clusters.map((c) => [c.name, c.groupIndex]))

		expect(byName.get('a')).toBe(0)
		expect(byName.get('b')).toBe(1)
	})

	it('routes the edges', () => {
		expect(points(model(), {}).edges).toHaveLength(4)
	})

	it('reports a canvas containing every cluster', () => {
		const result = points(model(), {})

		for (const c of result.clusters) {
			expect(result.size.w).toBeGreaterThanOrEqual(c.x + (c.w ?? 0))
			expect(result.size.h).toBeGreaterThanOrEqual(c.y + (c.h ?? 0))
		}
	})

	it('handles an empty model', () => {
		const result = points(normalizeGraph([], [], FIELDS), {})

		expect(result.cards).toEqual({})
		expect(result.size).toEqual({ w: 0, h: 0 })
	})

	it('handles a model with no edges at all', () => {
		// Every degree is 0, so maxDegree is 0 — the radius maths must not divide by it.
		const result = points(normalizeGraph(NODES, [], FIELDS), {})

		expect(Object.keys(result.cards)).toHaveLength(5)
		for (const card of Object.values(result.cards)) expect(card.w).toBeGreaterThan(0)
	})

	it('is deterministic — no simulation, no random seed', () => {
		expect(points(model(), {})).toEqual(points(model(), {}))
	})

	it('stays fast and compact on a thousand nodes', () => {
		// The case that motivated this layout. `cluster` produces 1780x18090 here, which fits
		// at 0.047 and renders a card 11.6px wide. Dots stay square-ish and legible.
		const nodes = Array.from({ length: 1000 }, (_, i) => ({
			key: `t${i % 10}.n${i}`,
			team: `t${i % 10}`,
			endpoints: []
		}))
		const edges = Array.from({ length: 2000 }, (_, i) => ({
			caller: `t${i % 10}.n${i % 1000}`,
			callee: `t${(i + 3) % 10}.n${(i * 7) % 1000}`
		}))

		const result = points(normalizeGraph(nodes, edges, FIELDS), {})
		const aspect = result.size.w / result.size.h

		expect(Object.keys(result.cards)).toHaveLength(1000)
		expect(aspect).toBeGreaterThan(0.4)
		expect(aspect).toBeLessThan(2.5)
	})
})
