import { describe, it, expect } from 'vitest'
import { normalizeGraph } from '../../src/model/normalize.js'
import { buildMatrix } from '../../src/layout/matrix.js'

// ui -> app -> core, ui -> core: a clean three-layer stack.
const LAYERED = {
	nodes: [
		{ id: 'ui', label: 'ui', group: 'web' },
		{ id: 'app', label: 'app', group: 'web' },
		{ id: 'core', label: 'core', group: 'lib' }
	],
	edges: [
		{ source: 'ui', target: 'app' },
		{ source: 'app', target: 'core' },
		{ source: 'ui', target: 'core' }
	]
}

const model = (g: { nodes: unknown[]; edges: unknown[] }) => normalizeGraph(g.nodes, g.edges)

describe('buildMatrix', () => {
	it('orders providers first, so a layered graph is lower-triangular', () => {
		const m = buildMatrix(model(LAYERED))
		expect(m.order).toEqual(['core', 'app', 'ui'])
		for (const cell of m.cells) expect(cell.row).toBeGreaterThan(cell.col)
		expect(m.above).toBe(0)
	})

	it('puts a row at the source and a column at the target', () => {
		const m = buildMatrix(model(LAYERED))
		const cell = m.cells.find((c) => c.source === 'app' && c.target === 'core')!
		expect([m.order[cell.row], m.order[cell.col]]).toEqual(['app', 'core'])
	})

	it('shows a cycle above the diagonal', () => {
		const cyclic = { ...LAYERED, edges: [...LAYERED.edges, { source: 'core', target: 'ui' }] }
		const m = buildMatrix(model(cyclic))
		const above = m.cells.filter((c) => c.above)
		expect(above.length).toBe(1)
		expect(m.above).toBe(1)
		expect(above[0].col).toBeGreaterThan(above[0].row)
	})

	it('aggregates parallel edges into one cell with a count', () => {
		const twice = {
			...LAYERED,
			edges: [...LAYERED.edges, { source: 'ui', target: 'app', relation: 'calls' }]
		}
		const m = buildMatrix(model(twice))
		expect(m.cells.find((c) => c.source === 'ui' && c.target === 'app')?.count).toBe(2)
		expect(m.maxCount).toBe(2)
	})

	it('counts a weighted edge as its weight — an aggregated import list folds nothing', () => {
		const weighted = {
			...LAYERED,
			edges: [{ source: 'ui', target: 'app', weight: 7 }, ...LAYERED.edges.slice(1)]
		}
		const m = buildMatrix(model(weighted))
		expect(m.cells.find((c) => c.source === 'ui' && c.target === 'app')?.count).toBe(7)
		expect(m.maxCount).toBe(7)
	})

	it('keeps groups contiguous and reports each as a block on the diagonal', () => {
		const m = buildMatrix(model(LAYERED), { groupBy: 'group' })
		expect(m.blocks).toEqual([
			{ name: 'lib', start: 0, end: 0 },
			{ name: 'web', start: 1, end: 2 }
		])
	})

	it('groups by kind, filing a node with no value under the empty key', () => {
		const kinds = {
			nodes: [
				{ id: 'ui', label: 'ui', kind: 'component' },
				{ id: 'app', label: 'app' },
				{ id: 'core', label: 'core', kind: 'module' }
			],
			edges: LAYERED.edges
		}
		expect(buildMatrix(model(kinds), { groupBy: 'kind' }).blocks).toEqual([
			{ name: 'module', start: 0, end: 0 },
			{ name: '', start: 1, end: 1 },
			{ name: 'component', start: 2, end: 2 }
		])
	})

	it('draws no blocks when not grouping', () => {
		expect(buildMatrix(model(LAYERED)).blocks).toEqual([])
	})

	it('ignores self-loops, unplaced edges and overlays', () => {
		const noisy = {
			nodes: LAYERED.nodes,
			edges: [
				...LAYERED.edges,
				{ source: 'ui', target: 'ui' },
				{ source: 'ui', target: 'nowhere' },
				{ source: 'core', target: 'ui', overlay: true }
			]
		}
		const m = buildMatrix(model(noisy))
		expect(m.cells.length).toBe(3)
		expect(m.above).toBe(0)
	})

	it('labels rows from node labels', () => {
		expect(buildMatrix(model(LAYERED)).labels).toEqual(['core', 'app', 'ui'])
	})

	it('handles an empty model', () => {
		const m = buildMatrix(normalizeGraph([], []))
		expect(m).toEqual({
			order: [],
			labels: [],
			groups: [],
			cells: [],
			blocks: [],
			above: 0,
			maxCount: 0
		})
	})
})
