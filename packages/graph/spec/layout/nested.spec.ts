/* Two-level clustering.
 *
 * Schema is the right axis for an ER diagram and a poor one for a dependency graph: one
 * schema holds a table, a trigger and a procedure, and the question a reader asks there is
 * "what are the routines and what do they touch". Nesting shows both facts at once instead of
 * trading one for the other, and which is OUTER is the reader's choice.
 *
 * The single-level path must stay byte-identical — 20 ported characterization tests in
 * clusters.spec.ts depend on it — so `nestBy` is strictly opt-in. */

import { describe, it, expect } from 'vitest'
import { cluster } from '../../src/layout/cluster.js'
import { normalizeGraph } from '../../src/model/normalize.js'
import type { GraphFields } from '../../src/types.js'

const FIELDS: GraphFields = {
	id: 'id',
	label: 'name',
	group: 'schema',
	kind: 'kind',
	source: 'from',
	target: 'to'
}

const NODES = [
	{ id: 'public.orders', schema: 'public', name: 'orders', kind: 'table' },
	{ id: 'public.users', schema: 'public', name: 'users', kind: 'table' },
	{ id: 'public.active_orders', schema: 'public', name: 'active_orders', kind: 'view' },
	{ id: 'public.place_order', schema: 'public', name: 'place_order', kind: 'procedure' },
	{ id: 'billing.invoices', schema: 'billing', name: 'invoices', kind: 'table' },
	{ id: 'billing.revenue', schema: 'billing', name: 'revenue', kind: 'materialized_view' }
]

const EDGES = [
	{ from: 'public.active_orders', to: 'public.orders' },
	{ from: 'public.place_order', to: 'public.orders' },
	{ from: 'billing.revenue', to: 'billing.invoices' }
]

const model = () => normalizeGraph(NODES, EDGES, FIELDS)
const at = (result: ReturnType<typeof cluster>, depth: number) =>
	result.clusters.filter((c) => (c.depth ?? 0) === depth)

describe('nested clustering', () => {
	it('stays single-level when nestBy is unset', () => {
		const result = cluster(model(), {})

		expect(result.clusters.every((c) => (c.depth ?? 0) === 0)).toBe(true)
		expect(result.clusters.map((c) => c.name).sort()).toEqual(['billing', 'public'])
	})

	it('honours groupBy on ONE level too, not only when nesting', () => {
		// The single-axis case is not a special case of nesting: `groupBy: 'kind'` with no
		// `nestBy` has to regroup the flat layout. Without this it silently kept grouping by
		// schema, so the control moved and the picture did not.
		const result = cluster(model(), { groupBy: 'kind' })

		expect(result.clusters.map((c) => c.name).sort()).toEqual([
			'materialized_view',
			'procedure',
			'table',
			'view'
		])
		expect(result.clusters.every((c) => (c.depth ?? 0) === 0)).toBe(true)
	})

	it('emits an outer box per schema and an inner box per kind within it', () => {
		const result = cluster(model(), { groupBy: 'group', nestBy: 'kind' })

		expect(at(result, 0).map((c) => c.name).sort()).toEqual(['billing', 'public'])
		expect(
			at(result, 1)
				.filter((c) => c.parent === 'public')
				.map((c) => c.name)
				.sort()
		).toEqual(['procedure', 'table', 'view'])
	})

	it('reverses cleanly — kind outside, schema inside', () => {
		const result = cluster(model(), { groupBy: 'kind', nestBy: 'group' })

		expect(at(result, 0).map((c) => c.name).sort()).toEqual([
			'materialized_view',
			'procedure',
			'table',
			'view'
		])
		expect(
			at(result, 1)
				.filter((c) => c.parent === 'table')
				.map((c) => c.name)
				.sort()
		).toEqual(['billing', 'public'])
	})

	it('emits every outer box BEFORE any inner one, so paint order nests them', () => {
		// Absolutely positioned siblings: the outer box must be painted first or it covers the
		// subdivisions it contains. No DOM tree needed — just this ordering.
		const depths = cluster(model(), { groupBy: 'group', nestBy: 'kind' }).clusters.map(
			(c) => c.depth ?? 0
		)

		expect(depths).toEqual([...depths].sort((a, b) => a - b))
	})

	it('contains every inner box inside its parent', () => {
		const result = cluster(model(), { groupBy: 'group', nestBy: 'kind' })
		const outer = new Map(at(result, 0).map((c) => [c.name, c]))

		for (const inner of at(result, 1)) {
			const box = outer.get(inner.parent as string)
			expect(box, inner.name).toBeDefined()
			expect(inner.x, `${inner.name}.x`).toBeGreaterThanOrEqual(box!.x)
			expect(inner.y, `${inner.name}.y`).toBeGreaterThanOrEqual(box!.y)
			expect(inner.x + (inner.w ?? 0)).toBeLessThanOrEqual(box!.x + (box!.w ?? 0) + 0.001)
			expect(inner.y + (inner.h ?? 0)).toBeLessThanOrEqual(box!.y + (box!.h ?? 0) + 0.001)
		}
	})

	it('contains every card inside its inner box', () => {
		const result = cluster(model(), { groupBy: 'group', nestBy: 'kind' })

		for (const inner of at(result, 1)) {
			for (const node of inner.list) {
				const card = result.cards[node.id]
				expect(card.x, node.id).toBeGreaterThanOrEqual(inner.x)
				expect(card.y, node.id).toBeGreaterThanOrEqual(inner.y)
				expect(card.x + card.w).toBeLessThanOrEqual(inner.x + (inner.w ?? 0) + 0.001)
				expect(card.y + card.h).toBeLessThanOrEqual(inner.y + (inner.h ?? 0) + 0.001)
			}
		}
	})

	it('never overlaps two outer boxes', () => {
		const boxes = at(cluster(model(), { groupBy: 'group', nestBy: 'kind' }), 0)

		for (let i = 0; i < boxes.length; i++) {
			for (let j = i + 1; j < boxes.length; j++) {
				const a = boxes[i]
				const b = boxes[j]
				const apart =
					a.x + (a.w ?? 0) <= b.x + 0.001 ||
					b.x + (b.w ?? 0) <= a.x + 0.001 ||
					a.y + (a.h ?? 0) <= b.y + 0.001 ||
					b.y + (b.h ?? 0) <= a.y + 0.001
				expect(apart, `${a.name} vs ${b.name}`).toBe(true)
			}
		}
	})

	it('places every node exactly once', () => {
		const result = cluster(model(), { groupBy: 'group', nestBy: 'kind' })
		const placed = at(result, 1).flatMap((c) => c.list.map((n) => n.id))

		expect(placed.sort()).toEqual(NODES.map((n) => n.id).sort())
		expect(Object.keys(result.cards).sort()).toEqual(NODES.map((n) => n.id).sort())
	})

	it('reports a canvas containing every outer box', () => {
		const result = cluster(model(), { groupBy: 'group', nestBy: 'kind' })

		for (const box of at(result, 0)) {
			expect(result.size.w).toBeGreaterThanOrEqual(box.x + (box.w ?? 0))
			expect(result.size.h).toBeGreaterThanOrEqual(box.y + (box.h ?? 0))
		}
	})

	it('still routes the edges', () => {
		expect(cluster(model(), { groupBy: 'group', nestBy: 'kind' }).edges).toHaveLength(3)
	})

	it('buckets a node with no value on the axis rather than dropping it', () => {
		const bare = [...NODES, { id: 'x', schema: 'public', name: 'x' }]
		const result = cluster(normalizeGraph(bare, [], FIELDS), {
			groupBy: 'group',
			nestBy: 'kind'
		})

		expect(Object.keys(result.cards)).toContain('x')
	})

	it('wraps outer boxes onto a second row rather than one endless line', () => {
		// Enough schemas to exceed MAX_ROW_W. Untested, this path silently laid every group out
		// in one row and produced a canvas thousands of pixels wide that fit at nothing.
		const many = Array.from({ length: 14 }, (_, i) => ({
			id: `s${i}.t`,
			schema: `s${i}`,
			name: 't',
			kind: 'table'
		}))
		const result = cluster(normalizeGraph(many, [], FIELDS), {
			groupBy: 'group',
			nestBy: 'kind'
		})
		const outer = at(result, 0)
		const rows = new Set(outer.map((c) => c.y))

		expect(rows.size).toBeGreaterThan(1)
		// And the wrap has to reset x, or row two starts where row one ended.
		expect(Math.min(...outer.filter((c) => c.y > 0).map((c) => c.x))).toBe(0)
	})

	it('handles an empty model', () => {
		// `placeOuters` reduces with Math.max over the outer boxes, which is -Infinity on an
		// empty list — a canvas of -Infinity renders as an SVG with a negative viewBox.
		const result = cluster(normalizeGraph([], [], FIELDS), {
			groupBy: 'group',
			nestBy: 'kind'
		})

		expect(result.clusters).toEqual([])
		expect(result.size).toEqual({ w: 0, h: 0 })
	})

	it('is deterministic', () => {
		const opts = { groupBy: 'group', nestBy: 'kind' } as const

		expect(cluster(model(), opts)).toEqual(cluster(model(), opts))
	})
})
