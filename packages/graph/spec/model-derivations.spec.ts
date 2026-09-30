import { describe, it, expect } from 'vitest'
import { normalizeGraph } from '../src/model/normalize.js'
import { relationshipsOf } from '../src/model/relationships.js'
import { entityRows } from '../src/model/entities.js'
import { contentExtent } from '../src/layout/extent.js'
import type { RoutedEdge } from '../src/layout/types.js'

const fields = { id: 'id', label: 'label', group: 'group', source: 'source', target: 'target' }
const model = normalizeGraph(
	[
		{ id: 'a', label: 'A', group: 'g1' },
		{ id: 'b', label: 'B', group: 'g2' },
		{ id: 'c', label: 'C' }
	],
	[
		{ source: 'a', target: 'b' },
		{ source: 'c', target: 'a' },
		{ source: 'a', target: 'a' },
		{ source: 'a', target: 'ghost' }
	],
	fields
)

describe('relationshipsOf', () => {
	it('lists every edge touching the node: out, in, a self-edge once, and an unplaced far end by name', () => {
		const rels = relationshipsOf(model, 'a', [])
		expect(rels.map((r) => [r.direction, r.id, r.label])).toEqual([
			['out', 'b', 'B'],
			['in', 'c', 'C'],
			['out', 'a', 'A'],
			['out', 'ghost', 'ghost']
		])
		expect(rels[0].group).toBe('g2')
		expect(rels.every((r) => r.edge)).toBe(true)
	})

	it('attaches routed geometry only for edges the layout placed', () => {
		const edge = model.edges[0]
		const routed = [{ id: edge.id } as unknown as RoutedEdge]
		const rels = relationshipsOf(model, 'a', routed)
		expect(rels[0].routed).toBe(routed[0])
		expect(rels[1].routed).toBeUndefined()
	})

	it('is empty with no node, or for a node no edge touches', () => {
		expect(relationshipsOf(model, null, [])).toEqual([])
		const lone = normalizeGraph([{ id: 'x', label: 'X' }], [], fields)
		expect(relationshipsOf(lone, 'x', [])).toEqual([])
	})
})

describe('entityRows', () => {
	it('is one row per node with its row count and the edges touching it', () => {
		const rows = entityRows(model)
		expect(rows.find((r) => r.id === 'a')).toMatchObject({ label: 'A', group: 'g1', rowCount: 0, refCount: 4 })
		expect(rows.find((r) => r.id === 'c')).toMatchObject({ refCount: 1 })
	})
})

describe('contentExtent', () => {
	it('is the bottom-right of the clusters', () => {
		expect(contentExtent([{ x: 10, y: 5, w: 100, h: 50 }, { x: 200, y: 0, w: 20, h: 90 }], {}, { w: 999, h: 999 })).toEqual({
			w: 220,
			h: 90
		})
	})
	it('falls back to the cards when there are no clusters, then to the layout size', () => {
		expect(contentExtent([], { a: { x: 0, y: 0, w: 40, h: 30 } }, { w: 999, h: 999 })).toEqual({ w: 40, h: 30 })
		expect(contentExtent([], {}, { w: 300, h: 200 })).toEqual({ w: 300, h: 200 })
	})
	it('treats a cluster with no size as a point', () => {
		expect(contentExtent([{ x: 50, y: 60 }], {}, { w: 1, h: 1 })).toEqual({ w: 50, h: 60 })
	})
})
