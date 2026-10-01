/* #168 — Lanza's System Complexity view: a containment tree whose every leaf is a box with
 * WIDTH, HEIGHT and SHADE bound to three independent measures.
 */
import { describe, it, expect } from 'vitest'
import { polymetric } from '../../src/layout/polymetric.js'
import { normalizeGraph } from '../../src/model/normalize.js'
import type { Cluster } from '../../src/layout/types.js'

const FIELDS = { id: 'id', label: 'name', source: 'source', target: 'target' }
const NODES = [
	{ id: 'crate', name: 'senseid', parent: null },
	{ id: 'indexer', name: 'indexer', parent: 'crate' },
	{ id: 'resolve', name: 'resolve.rs', parent: 'indexer', measures: { fns: 84, loc: 4460, churn: 37 } },
	{ id: 'fqn', name: 'fqn.rs', parent: 'indexer', measures: { fns: 12, loc: 380, churn: 2 } },
	{ id: 'walk', name: 'walk.rs', parent: 'indexer', measures: { fns: 61, loc: 2210, churn: 19 } },
	{ id: 'api', name: 'api', parent: 'crate' },
	{ id: 'routes', name: 'routes.rs', parent: 'api', measures: { fns: 5, loc: 100 } },
	{ id: 'empty', name: 'empty.rs', parent: 'api', measures: { fns: 0, loc: 0, churn: 0 } }
]
const OPTS = { widthBy: 'fns', heightBy: 'loc', colorBy: 'churn' }
const run = (nodes: unknown[] = NODES, opts = OPTS) => polymetric(normalizeGraph(nodes, [], FIELDS), opts as never)
const box = (r: ReturnType<typeof run>, id: string) => r.clusters.find((c) => (c.nodeId ?? c.declared) === id) as Cluster

describe('polymetric — three measures at once', () => {
	it('is a box per tree node: containers labelled, leaves selectable', () => {
		const r = run()
		expect(r.clusters.map((c) => c.name).sort()).toEqual(
			['api', 'empty.rs', 'fqn.rs', 'indexer', 'resolve.rs', 'routes.rs', 'senseid', 'walk.rs'].sort()
		)
		expect(box(r, 'resolve').nodeId).toBe('resolve')
		expect(box(r, 'indexer').nodeId).toBeUndefined()
	})

	it('binds width and height to their own measures, independently', () => {
		const r = run()
		expect(box(r, 'resolve').w!).toBeGreaterThan(box(r, 'walk').w!)
		expect(box(r, 'walk').w!).toBeGreaterThan(box(r, 'fqn').w!)
		expect(box(r, 'resolve').h!).toBeGreaterThan(box(r, 'walk').h!)
		// Swap the height measure: the widths do not move.
		const swapped = run(NODES, { ...OPTS, heightBy: 'churn' })
		expect(box(swapped, 'fqn').w).toBe(box(r, 'fqn').w)
		expect(box(swapped, 'fqn').h).not.toBe(box(r, 'fqn').h)
	})

	it('shades by the colour measure, 0..1', () => {
		const r = run()
		expect(box(r, 'resolve').shade).toBe(1)
		expect(box(r, 'fqn').shade!).toBeGreaterThan(0)
		expect(box(r, 'fqn').shade!).toBeLessThan(box(r, 'walk').shade!)
	})
})

describe('polymetric — degenerate values', () => {
	it('draws a zero at the minimum size, as a value — not as missing', () => {
		const r = run()
		const empty = box(r, 'empty')
		expect(empty.w).toBe(Math.min(...r.clusters.filter((c) => c.nodeId).map((c) => c.w!)))
		expect(empty.missing ?? []).toEqual([])
		expect(empty.shade).toBe(0)
	})

	it('marks a missing measure instead of drawing it as zero', () => {
		const routes = box(run(), 'routes')
		expect(routes.missing).toEqual(['color'])
		expect(routes.shade).toBeUndefined()
	})

	it('keeps one dominating file from flattening the rest — it clamps, and says so', () => {
		const many = Array.from({ length: 20 }, (_, i) => ({ id: `f${i}`, name: `f${i}`, parent: 'p', measures: { fns: i + 1, loc: 10 } }))
		const r = run([{ id: 'p', name: 'p' }, ...many, { id: 'giant', name: 'giant', parent: 'p', measures: { fns: 10000, loc: 10 } }], {
			widthBy: 'fns',
			heightBy: 'loc'
		} as never)
		const widths = many.map((n) => box(r, n.id).w!)
		expect(Math.max(...widths)).toBeGreaterThan(Math.min(...widths) * 3)
		expect(box(r, 'giant').clamped).toEqual(['width'])
		expect(box(r, 'giant').w).toBeGreaterThanOrEqual(Math.max(...widths))
	})

	it('reads degree and weight as measures too', () => {
		const nodes = [
			{ id: 'p', name: 'p' },
			{ id: 'a', name: 'a', parent: 'p', weight: 9 },
			{ id: 'b', name: 'b', parent: 'p', weight: 1 }
		]
		const m = normalizeGraph(nodes, [{ source: 'a', target: 'b' }, { source: 'a', target: 'p' }], FIELDS)
		const r = polymetric(m, { widthBy: 'degree', heightBy: 'weight' } as never)
		const a = r.clusters.find((c) => c.nodeId === 'a')!
		const b = r.clusters.find((c) => c.nodeId === 'b')!
		expect(a.w!).toBeGreaterThan(b.w!)
		expect(a.h!).toBeGreaterThan(b.h!)
	})

	it('leaves the shade off when no colour measure is bound', () => {
		const r = run(NODES, { widthBy: 'fns', heightBy: 'loc' } as never)
		expect(r.clusters.every((c) => c.shade === undefined)).toBe(true)
		expect(r.channels?.color).toBeUndefined()
	})
})

describe('polymetric — the tree', () => {
	it('places every child below its parent, siblings side by side without overlap', () => {
		const r = run()
		for (const [child, parent] of [['indexer', 'crate'], ['resolve', 'indexer'], ['routes', 'api']]) {
			expect(box(r, child).y).toBeGreaterThan(box(r, parent).y)
		}
		const siblings = ['resolve', 'fqn', 'walk'].map((id) => box(r, id)).sort((a, b) => a.x - b.x)
		for (let i = 1; i < siblings.length; i++) expect(siblings[i].x).toBeGreaterThanOrEqual(siblings[i - 1].x + siblings[i - 1].w!)
	})

	it('tops every box at one depth on one line, so heights compare at a glance', () => {
		const r = run()
		expect(new Set(['resolve', 'fqn', 'walk', 'routes', 'empty'].map((id) => box(r, id).y)).size).toBe(1)
	})

	it('draws a containment link from each parent to each child', () => {
		const r = run()
		const links = r.edges.map((e) => `${e.fromKey}>${e.toKey}`).sort()
		expect(links).toContain('crate>indexer')
		expect(links).toContain('indexer>resolve')
		expect(r.edges.every((e) => e.kind === 'containment')).toBe(true)
	})

	it('reports which measure is on which channel, and each channel’s cap', () => {
		const ch = run().channels!
		expect(ch.width).toMatchObject({ measure: 'fns' })
		expect(ch.height).toMatchObject({ measure: 'loc' })
		expect(ch.color).toMatchObject({ measure: 'churn' })
		expect(ch.width.cap).toBeGreaterThan(0)
	})

	it('is empty for an empty model', () => {
		expect(run([])).toMatchObject({ clusters: [], edges: [] })
	})
})
