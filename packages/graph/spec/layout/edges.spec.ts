/* Characterization tests for edge routing, ported from dbd's layout-edges.test.ts.
   Every coordinate and every exact SVG path string is carried over unchanged — only the
   fixture SHAPE moves (LayoutData refs -> GraphEdge[]). A failing number or path here means
   the port changed the geometry; fix the port, never the expectation. */

import { it, expect, describe } from 'vitest'
import { buildEdges, edgePath } from '../../src/layout/edges.js'
import type { Cards, Card, RoutedEdge } from '../../src/layout/types.js'
import type { GraphEdge, GraphNode, GraphRow } from '../../src/types.js'

function row(name: string): GraphRow {
	return { name, type: 'text', badges: [] }
}

function node(id: string): GraphNode {
	return { id, label: id, rows: [], meta: {} }
}

function makeCard(x: number, y: number, w: number, h: number, vis: GraphRow[] = []): Card {
	return { node: node('s.t'), vis, more: 0, w, h, x, y }
}

function edge(source: string, target: string, sourceRow: string, targetRow: string): GraphEdge {
	return {
		id: `${source}->${target}`,
		source,
		target,
		sourceRow,
		targetRow,
		kind: 'reference'
	}
}

describe('buildEdges / buildEdge', () => {
	it('skips a ref whose endpoint is not laid out', () => {
		const cards: Cards = { 'a.x': makeCard(0, 0, 248, 100) }

		expect(buildEdges([edge('a.x', 'b.y', 'id', 'id')], cards)).toEqual([])
	})

	it('builds a self-loop edge on the right edge (y1 !== y2)', () => {
		const cards: Cards = { 'a.x': makeCard(0, 0, 248, 100, [row('id'), row('parent_id')]) }
		const edges = buildEdges([edge('a.x', 'a.x', 'parent_id', 'id')], cards)

		expect(edges).toHaveLength(1)
		expect(edges[0]).toMatchObject({
			i: 0,
			fromKey: 'a.x',
			toKey: 'a.x',
			self: true,
			x1: 248,
			y1: 76,
			x2: 248,
			y2: 52,
			s1: 1,
			s2: 1
		})
	})

	it('nudges a self-loop endpoint by +14 when both anchors land on the same y', () => {
		const cards: Cards = { 'a.x': makeCard(0, 0, 248, 100, [row('id'), row('parent_id')]) }
		const edges = buildEdges([edge('a.x', 'a.x', 'id', 'id')], cards)

		expect(edges[0]).toMatchObject({ self: true, x1: 248, y1: 52, x2: 248, y2: 66, s1: 1, s2: 1 })
	})

	it('routes right-to-left when a sits far enough left of b', () => {
		const cards: Cards = {
			'a.x': makeCard(0, 0, 248, 100, [row('id')]),
			'b.y': makeCard(300, 0, 248, 100, [row('id')])
		}
		const edges = buildEdges([edge('a.x', 'b.y', 'id', 'id')], cards)

		expect(edges[0]).toMatchObject({ self: false, x1: 248, y1: 52, x2: 300, y2: 52, s1: 1, s2: -1 })
	})

	it('routes left-to-right when b sits far enough left of a', () => {
		const cards: Cards = {
			'a.x': makeCard(400, 0, 100, 100, [row('id')]),
			'b.y': makeCard(0, 0, 200, 100, [row('id')])
		}
		const edges = buildEdges([edge('a.x', 'b.y', 'id', 'id')], cards)

		expect(edges[0]).toMatchObject({ self: false, x1: 400, y1: 52, x2: 200, y2: 52, s1: -1, s2: 1 })
	})

	it('falls back to the stacked (both-right) route when neither side has a 50px gap', () => {
		const cards: Cards = {
			'a.x': makeCard(0, 0, 248, 100, [row('id')]),
			'b.y': makeCard(100, 0, 248, 100, [row('id')])
		}
		const edges = buildEdges([edge('a.x', 'b.y', 'id', 'id')], cards)

		expect(edges[0]).toMatchObject({ self: false, x1: 248, y1: 52, x2: 348, y2: 52, s1: 1, s2: 1 })
	})

	it('preserves the original refs index even when an earlier ref is skipped', () => {
		const cards: Cards = {
			'a.x': makeCard(0, 0, 248, 100, [row('id')]),
			'b.y': makeCard(300, 0, 248, 100, [row('id')])
		}
		const edges = buildEdges(
			[edge('zz.missing', 'b.y', 'id', 'id'), edge('a.x', 'b.y', 'id', 'id')],
			cards
		)

		expect(edges).toHaveLength(1)
		expect(edges[0].i).toBe(1)
	})

	it('carries the canonical edge id and kind onto the routed edge', () => {
		// New: RoutedEdge replaces the source's opaque `ref` with id + kind. The id keys the
		// rendered `{#each}`, and the kind is what a theme branches on, so neither may be
		// dropped in routing.
		const cards: Cards = {
			'a.x': makeCard(0, 0, 248, 100, [row('id')]),
			'b.y': makeCard(300, 0, 248, 100, [row('id')])
		}
		const edges = buildEdges(
			[{ id: 'custom-id', source: 'a.x', target: 'b.y', kind: 'dependency' }],
			cards
		)

		expect(edges[0]).toMatchObject({ id: 'custom-id', kind: 'dependency' })
	})

	it('anchors at the head centre when the edge names no row', () => {
		// New: sourceRow/targetRow are optional on a canonical edge (a dependency edge has no
		// column anchors at all), where a dbd ref always carried `c`. An unset anchor must
		// take the same head-centre fallback a non-matching name already took.
		const cards: Cards = {
			'a.x': makeCard(0, 0, 248, 100, [row('id')]),
			'b.y': makeCard(300, 0, 248, 100, [row('id')])
		}
		const edges = buildEdges([{ id: 'e', source: 'a.x', target: 'b.y', kind: 'dependency' }], cards)

		expect(edges[0]).toMatchObject({ y1: 20, y2: 20 })
	})
})

describe('edgePath', () => {
	const base = { i: 0, id: 'e', fromKey: 'a', toKey: 'b', kind: 'reference' as const }

	it('draws a self-loop bow regardless of style', () => {
		const e: RoutedEdge = { ...base, self: true, x1: 10, y1: 20, x2: 10, y2: 60, s1: 1, s2: 1 }

		expect(edgePath(e, 'curved')).toBe('M 10 20 C 56 20, 56 60, 10 60')
		expect(edgePath(e, 'orthogonal')).toBe('M 10 20 C 56 20, 56 60, 10 60')
	})

	it('draws an orthogonal path via the midpoint when sides are opposite (s1=1,s2=-1)', () => {
		const e: RoutedEdge = { ...base, self: false, x1: 0, y1: 10, x2: 300, y2: 200, s1: 1, s2: -1 }

		expect(edgePath(e, 'orthogonal')).toBe('M 0 10 H 150 V 200 H 300')
	})

	it('draws an orthogonal path via the midpoint when sides are opposite (s1=-1,s2=1)', () => {
		const e: RoutedEdge = { ...base, self: false, x1: 300, y1: 10, x2: 0, y2: 200, s1: -1, s2: 1 }

		expect(edgePath(e, 'orthogonal')).toBe('M 300 10 H 150 V 200 H 0')
	})

	it('draws an orthogonal stacked-fallback path routed around the right (s1=1,s2=1)', () => {
		const e: RoutedEdge = { ...base, self: false, x1: 100, y1: 10, x2: 150, y2: 200, s1: 1, s2: 1 }

		expect(edgePath(e, 'orthogonal')).toBe('M 100 10 H 202 V 200 H 150')
	})

	it('draws a curved path bowing the same direction when s1 === s2', () => {
		const e: RoutedEdge = { ...base, self: false, x1: 100, y1: 10, x2: 150, y2: 200, s1: 1, s2: 1 }

		expect(edgePath(e, 'curved')).toBe('M 100 10 C 164 10, 214 200, 150 200')
	})

	it('draws a curved path with the control-point offset clamped to a 46px minimum', () => {
		const e: RoutedEdge = { ...base, self: false, x1: 100, y1: 10, x2: 110, y2: 200, s1: 1, s2: -1 }

		expect(edgePath(e, 'curved')).toBe('M 100 10 C 146 10, 64 200, 110 200')
	})

	it('draws a curved path with the control-point offset clamped to a 170px maximum', () => {
		const e: RoutedEdge = { ...base, self: false, x1: 0, y1: 10, x2: 1000, y2: 200, s1: 1, s2: -1 }

		expect(edgePath(e, 'curved')).toBe('M 0 10 C 170 10, 830 200, 1000 200')
	})

	it('draws a curved path with an unclamped control-point offset (half the x distance)', () => {
		const e: RoutedEdge = { ...base, self: false, x1: 0, y1: 10, x2: 200, y2: 200, s1: 1, s2: -1 }

		expect(edgePath(e, 'curved')).toBe('M 0 10 C 100 10, 100 200, 200 200')
	})
})
