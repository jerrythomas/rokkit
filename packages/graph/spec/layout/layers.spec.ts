/* #167 — the layered layout: host-assigned layers as horizontal bands, layer 0 at the top. */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { layers } from '../../src/layout/layers.js'
import { normalizeGraph } from '../../src/model/normalize.js'
import { resetOptionWarnings } from '../../src/layout/options.js'

const FIELDS = { id: 'id', label: 'name', source: 'source', target: 'target' }
const NODES = [
	{ id: 'api', name: 'api', layer: 0 },
	{ id: 'tasks', name: 'tasks', layer: 1 },
	{ id: 'indexer', name: 'indexer', layer: 2 },
	{ id: 'db', name: 'db', layer: 3 },
	{ id: 'config', name: 'config', layer: 4 }
]
const EDGES = [
	{ source: 'api', target: 'tasks' },
	{ source: 'tasks', target: 'indexer' },
	{ source: 'indexer', target: 'db' },
	{ source: 'db', target: 'tasks' },
	{ source: 'api', target: 'db' }
]
const run = (nodes = NODES, edges = EDGES, options = {}) => layers(normalizeGraph(nodes, edges, FIELDS), options)

beforeEach(() => resetOptionWarnings())

describe('layers — bands', () => {
	it('is one labelled band per layer, layer 0 at the top', () => {
		const r = run()
		expect(r.clusters.map((c) => c.name)).toEqual(['Layer 0', 'Layer 1', 'Layer 2', 'Layer 3', 'Layer 4'])
		const ys = r.clusters.map((c) => c.y)
		expect([...ys].sort((a, b) => a - b)).toEqual(ys)
	})

	it('names bands from layerLabels, and keeps every band the full width', () => {
		const r = run(NODES, EDGES, { layerLabels: ['Interface', 'Domain'] })
		expect(r.clusters.slice(0, 3).map((c) => c.name)).toEqual(['Interface', 'Domain', 'Layer 2'])
		expect(new Set(r.clusters.map((c) => c.w)).size).toBe(1)
	})

	it('puts every card inside its own layer’s band', () => {
		const r = run()
		r.clusters.forEach((band) => {
			for (const node of band.list) {
				const card = r.cards[node.id]
				expect(card.y).toBeGreaterThanOrEqual(band.y)
				expect(card.y + card.h).toBeLessThanOrEqual(band.y + band.h!)
			}
		})
	})

	it('wraps a crowded layer into rows, without overlapping cards', () => {
		const many = Array.from({ length: 20 }, (_, i) => ({ id: `n${i}`, name: `n${i}`, layer: 0 }))
		const r = run([...many, { id: 'x', name: 'x', layer: 1 }], [])
		const rows = new Set(many.map((n) => r.cards[n.id].y))
		expect(rows.size).toBeGreaterThan(1)
		const boxes = many.map((n) => r.cards[n.id])
		for (const a of boxes)
			for (const b of boxes)
				if (a !== b) expect(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y).toBe(true)
	})

	it('sends a node with no layer to an Unassigned band at the bottom', () => {
		const r = run([...NODES, { id: 'loose', name: 'loose' }], EDGES)
		expect(r.clusters.at(-1)?.name).toBe('Unassigned')
		expect(r.clusters.at(-1)?.list.map((n) => n.id)).toEqual(['loose'])
	})

	it('orders a layer by where its neighbours sit in the layer above — fewer crossings', () => {
		const nodes = [
			{ id: 'a', name: 'a', layer: 0 },
			{ id: 'b', name: 'b', layer: 0 },
			{ id: 'under-b', name: 'aaa', layer: 1 },
			{ id: 'under-a', name: 'zzz', layer: 1 }
		]
		const r = run(nodes, [
			{ source: 'a', target: 'under-a' },
			{ source: 'b', target: 'under-b' }
		])
		expect(r.cards['a'].x).toBeLessThan(r.cards['b'].x)
		// Alphabetical would put 'aaa' first; its parent is on the right, so it goes right.
		expect(r.cards['under-a'].x).toBeLessThan(r.cards['under-b'].x)
	})

	it('is empty for an empty model', () => {
		expect(run([], [])).toMatchObject({ clusters: [], cards: {}, edges: [] })
	})
})

describe('layers — edges', () => {
	const conf = (r: ReturnType<typeof run>, from: string, to: string) =>
		r.edges.find((e) => e.fromKey === from && e.toKey === to)?.conformance

	it('derives conformance from the layers when the host gives none', () => {
		const r = run([...NODES, { id: 'peer', name: 'peer', layer: 1 }], [...EDGES, { source: 'tasks', target: 'peer' }])
		expect(conf(r, 'api', 'tasks')).toBe('down')
		expect(conf(r, 'api', 'db')).toBe('skip')
		expect(conf(r, 'db', 'tasks')).toBe('up')
		expect(conf(r, 'tasks', 'peer')).toBe('level')
	})

	it('keeps the host’s conformance over the derived one', () => {
		const r = run(NODES, [{ source: 'api', target: 'tasks', conformance: 'up' }])
		expect(conf(r, 'api', 'tasks')).toBe('up')
	})

	it('gives no conformance to an edge whose end has no layer — there is nothing to compare', () => {
		const r = run([...NODES, { id: 'loose', name: 'loose' }], [{ source: 'api', target: 'loose' }])
		expect(r.edges).toHaveLength(1)
		expect(r.edges[0].conformance).toBeUndefined()
	})

	it('draws no self-edge — a module importing itself says nothing about layering', () => {
		expect(run(NODES, [{ source: 'api', target: 'api' }]).edges).toEqual([])
	})

	it('shows only the violations when asked', () => {
		const r = run(NODES, EDGES, { showEdges: 'violations' })
		expect(r.edges.map((e) => `${e.fromKey}>${e.toKey}`)).toEqual(['db>tasks'])
	})

	it('runs a down edge from the source’s bottom to the target’s top, and a climbing one the other way', () => {
		const r = run()
		const down = r.edges.find((e) => e.fromKey === 'api' && e.toKey === 'tasks')!
		expect(down.y1).toBe(r.cards['api'].y + r.cards['api'].h)
		expect(down.y2).toBe(r.cards['tasks'].y)
		const up = r.edges.find((e) => e.fromKey === 'db' && e.toKey === 'tasks')!
		expect(up.y1).toBe(r.cards['db'].y)
		expect(up.y2).toBe(r.cards['tasks'].y + r.cards['tasks'].h)
		expect(up.path).toMatch(/^M /)
	})

	it('warns about an option no layout knows (it is handed every known one)', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		run(NODES, EDGES, { nope: true } as never)
		expect(warn).toHaveBeenCalled()
		warn.mockRestore()
	})
})
