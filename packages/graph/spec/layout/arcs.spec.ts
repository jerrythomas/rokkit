/* #169 — the dual arc diagram: one shared, ordered axis of items, the coupling the code declares
 * on one side and the coupling the history reveals on the other.
 */
import { describe, it, expect } from 'vitest'
import { arcs } from '../../src/layout/arcs.js'
import { normalizeGraph } from '../../src/model/normalize.js'
import type { RoutedEdge } from '../../src/layout/types.js'

/* #169's sample, verbatim — `set` names the relation. */
const ITEMS = [
	{ id: 'file:resolve', name: 'resolve.rs', group: 'indexer' },
	{ id: 'file:walk', name: 'walk.rs', group: 'indexer' },
	{ id: 'file:fqn', name: 'fqn.rs', group: 'indexer' },
	{ id: 'file:persist', name: 'persist.rs', group: 'db' }
]
const RELATIONS = [
	{ set: 'imports', source: 'file:resolve', target: 'file:fqn', weight: 3 },
	{ set: 'imports', source: 'file:walk', target: 'file:fqn', weight: 1 },
	{ set: 'cochange', source: 'file:resolve', target: 'file:walk', weight: 18 },
	{ set: 'cochange', source: 'file:resolve', target: 'file:persist', weight: 11, hidden: true },
	{ set: 'cochange', source: 'file:resolve', target: 'file:fqn', weight: 9 }
]
const FIELDS = { id: 'id', label: 'name', group: 'group', relation: 'set' }
const sample = (options = {}) =>
	arcs(normalizeGraph(ITEMS, RELATIONS, FIELDS), { above: 'cochange', ...options } as never)
const pair = (edges: RoutedEdge[], from: string, to: string) =>
	edges.find((e) => e.fromKey === from && e.toKey === to)!

describe('arcs — one shared axis', () => {
	it('is one box per item, in one column, ordered by group and then as given', () => {
		const nodes = [
			{ id: 'a', name: 'a', group: 'g' },
			{ id: 'b', name: 'b', group: 'h' },
			{ id: 'c', name: 'c', group: 'g' }
		]
		const r = arcs(normalizeGraph(nodes, [], FIELDS), {})
		const ys = Object.fromEntries(r.clusters.map((c) => [c.nodeId, c.y]))
		expect(ys.a).toBeLessThan(ys.c)
		expect(ys.c).toBeLessThan(ys.b)
		expect(new Set(r.clusters.map((c) => c.x)).size).toBe(1)
		expect(new Set(r.clusters.map((c) => c.w)).size).toBe(1)
	})

	it('names each box by its item and tints it by its group', () => {
		const resolve = sample().clusters.find((c) => c.nodeId === 'file:resolve')!
		expect(resolve).toMatchObject({ name: 'resolve.rs', ramp: 'indexer' })
	})

	it('counts the arcs at each item, on both sides', () => {
		expect(sample().clusters.find((c) => c.nodeId === 'file:resolve')?.count).toBe(4)
	})
})

describe('arcs — two relation sets', () => {
	it('draws the named set on the right, the rest on the left', () => {
		const r = sample()
		expect(pair(r.edges, 'file:resolve', 'file:fqn')).toBeDefined()
		const sides = r.edges.map((e) => `${e.relation}:${e.side}`)
		expect(sides.filter((s) => s.startsWith('imports'))).toEqual(['imports:below', 'imports:below'])
		expect(sides.filter((s) => s.startsWith('cochange'))).toEqual(['cochange:above', 'cochange:above', 'cochange:above'])
	})

	it('without `above`, puts overlays on the right — observed, not declared', () => {
		const edges = [
			{ source: 'a', target: 'b' },
			{ source: 'a', target: 'b', overlay: true }
		]
		const r = arcs(normalizeGraph([{ id: 'a' }, { id: 'b' }], edges, {}), {})
		expect(r.edges.map((e) => [Boolean(e.overlay), e.side])).toEqual([
			[false, 'below'],
			[true, 'above']
		])
	})

	it('leaves the left side from the box’s left edge, bulging left — and the right, right', () => {
		const r = sample()
		const box = r.clusters.find((c) => c.nodeId === 'file:resolve')!
		const left = pair(r.edges, 'file:resolve', 'file:fqn')
		const right = r.edges.find((e) => e.side === 'above' && e.toKey === 'file:fqn')!
		expect(left.x1).toBe(box.x)
		expect(right.x1).toBe(box.x + box.w!)
		expect(left.path).toMatch(/^M [\d.]+ [\d.]+ A /)
		// Sweep flag: 0 bends a downward arc to the left, 1 to the right.
		expect(left.path).toMatch(/ 0 0 0 /)
		expect(right.path).toMatch(/ 0 0 1 /)
	})

	it('joins the two items’ centres, whichever way the edge points', () => {
		const r = sample()
		const box = (id: string) => r.clusters.find((c) => c.nodeId === id)!
		const e = pair(r.edges, 'file:walk', 'file:fqn')
		expect([e.y1, e.y2].sort((a, b) => a - b)).toEqual(
			[box('file:walk').y + box('file:walk').h! / 2, box('file:fqn').y + box('file:fqn').h! / 2].sort((a, b) => a - b)
		)
	})
})

describe('arcs — weight and the hidden pairs', () => {
	it('scales thickness per side: each set against its own heaviest', () => {
		const r = sample()
		expect(pair(r.edges, 'file:resolve', 'file:fqn').relation).toBe('imports')
		const strength = Object.fromEntries(r.edges.map((e) => [`${e.relation}:${e.fromKey}>${e.toKey}`, e.strength]))
		expect(strength['imports:file:resolve>file:fqn']).toBe(1)
		expect(strength['imports:file:walk>file:fqn']).toBeCloseTo(1 / 3)
		expect(strength['cochange:file:resolve>file:walk']).toBe(1)
		expect(strength['cochange:file:resolve>file:fqn']).toBeCloseTo(0.5)
	})

	it('caps each side at its 95th percentile, so one outlier does not flatten the rest', () => {
		const nodes = Array.from({ length: 21 }, (_, i) => ({ id: `n${i}` }))
		const weights = [...Array.from({ length: 19 }, (_, i) => i + 1), 1000]
		const edges = weights.map((weight, i) => ({ source: 'n0', target: `n${i + 1}`, weight }))
		const r = arcs(normalizeGraph(nodes, edges, {}), {})
		const at = (w: number) => r.edges.find((e) => e.weight === w)!.strength
		expect(at(19)).toBe(1)
		expect(at(10)).toBeCloseTo(10 / 19)
		// Past the cap it clamps: the outlier is as thick as the cap, not 50 times thicker.
		expect(at(1000)).toBe(1)
	})

	it('leaves an unweighted edge’s strength unset', () => {
		const r = arcs(normalizeGraph([{ id: 'a' }, { id: 'b' }], [{ source: 'a', target: 'b' }], {}), {})
		expect(r.edges[0].strength).toBeUndefined()
	})

	it('carries the hidden flag, and `showEdges: hidden` keeps only those', () => {
		expect(sample().edges.filter((e) => e.hidden).map((e) => e.toKey)).toEqual(['file:persist'])
		const only = sample({ showEdges: 'hidden' })
		expect(only.edges.map((e) => `${e.fromKey}>${e.toKey}`)).toEqual(['file:resolve>file:persist'])
		// The axis does not change: every item stays where it was.
		expect(only.clusters).toEqual(sample().clusters)
	})

	it('draws nothing for an edge to an item not on the axis, and does not widen for it', () => {
		const nodes = [{ id: 'a' }, { id: 'b' }]
		const lone = arcs(normalizeGraph(nodes, [], {}), {})
		const r = arcs(normalizeGraph(nodes, [{ source: 'a', target: 'ghost' }], {}), {})
		expect(r.edges).toEqual([])
		expect(r.size).toEqual(lone.size)
	})

	it('drops a self edge — an arc needs two places on the axis', () => {
		const r = arcs(normalizeGraph([{ id: 'a' }], [{ source: 'a', target: 'a' }], {}), {})
		expect(r.edges).toEqual([])
	})
})

describe('arcs — size', () => {
	it('is empty for no items', () => {
		expect(arcs(normalizeGraph([], [], {}), {})).toEqual({ clusters: [], cards: {}, edges: [], size: { w: 0, h: 0 } })
	})

	it('holds every box and the widest arc on each side', () => {
		const r = sample()
		const bottom = Math.max(...r.clusters.map((c) => c.y + c.h!))
		expect(r.size.h).toBeGreaterThan(bottom)
		const leftmost = Math.min(...r.clusters.map((c) => c.x))
		expect(leftmost).toBeGreaterThan(0)
		// The widest right arc spans resolve (row 0) to persist (row 3).
		const box = r.clusters[0]
		expect(r.size.w).toBeGreaterThan(box.x + box.w!)
	})

	it('grows with the items: ~50 stay one row each', () => {
		const many = Array.from({ length: 50 }, (_, i) => ({ id: `n${i}` }))
		const r = arcs(normalizeGraph(many, [{ source: 'n0', target: 'n49' }], {}), {})
		const ys = r.clusters.map((c) => c.y)
		expect(new Set(ys).size).toBe(50)
		expect(Math.min(...ys.slice(1).map((y, i) => y - ys[i]))).toBeGreaterThanOrEqual(r.clusters[0].h!)
	})
})
