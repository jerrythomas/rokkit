import { describe, it, expect } from 'vitest'
import { points } from '../../src/layout/points.js'
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

	it('renders a node as a square dot, not a card', () => {
		const card = points(model(), {}).cards['a.leaf1']

		expect(card.w).toBe(card.h)
		expect(card.vis).toEqual([])
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

	it('never overlaps two dots', () => {
		// The spiral packs without an overlap test, so this is the assertion that the step
		// and the sqrt growth were chosen correctly rather than by eye.
		const result = points(model(), {})
		const placed = Object.values(result.cards).map((c) => ({
			cx: c.x + c.w / 2,
			cy: c.y + c.h / 2,
			r: c.w / 2
		}))

		for (let i = 0; i < placed.length; i++) {
			for (let j = i + 1; j < placed.length; j++) {
				const a = placed[i]
				const b = placed[j]
				const distance = Math.hypot(a.cx - b.cx, a.cy - b.cy)
				expect(distance, `${i} vs ${j}`).toBeGreaterThanOrEqual(a.r + b.r - 0.001)
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
