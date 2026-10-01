/* What an edge carries onto the canvas, in EVERY layout.
 *
 * `weight` drives stroke width and `weakest` (#166) names the link to cut — both are facts
 * about the edge, so a layout that routes it must carry them. `flow` and `radial` built their
 * routed edges with their own identity half and dropped `weight`, so a weighted edge drew at
 * the normal width there and only there.
 */
import { describe, it, expect } from 'vitest'
import { GraphState } from '../src/GraphState.svelte.js'

const nodes = [
	{ id: 'a', label: 'a', group: 'g', path: ['p', 'a'] },
	{ id: 'b', label: 'b', group: 'g', path: ['p', 'b'] },
	{ id: 'c', label: 'c', group: 'h', path: ['q', 'c'] }
]
const edges = [
	{ source: 'a', target: 'b', weight: 7, weakest: true },
	{ source: 'b', target: 'c', weight: 3 }
]
const fields = { id: 'id', label: 'label', group: 'group', path: 'path', source: 'source', target: 'target' }

describe.each(['cluster', 'flow', 'points', 'radial', 'structure', 'neighborhood'])('%s', (layout) => {
	it('carries weight and the weakest flag onto the routed edge', () => {
		const s = new GraphState({ nodes, edges, fields, layout, focus: 'b', levels: 3 })
		const ab = s.routedEdges.find((e) => e.fromKey === 'a' && e.toKey === 'b')
		expect(ab, 'a→b routed').toBeDefined()
		expect(ab?.weight).toBe(7)
		expect(ab?.weakest).toBe(true)
		const bc = s.routedEdges.find((e) => e.fromKey === 'b' && e.toKey === 'c')
		if (bc) expect(bc.weakest).toBeUndefined()
	})
})

describe('buildEdges — a condensed edge', () => {
	it('carries how many model edges it stands for', async () => {
		const { buildEdges } = await import('../src/layout/edges.js')
		// Real cards from a laid-out state; the edge is what condensation would hand the layout.
		const { cards } = new GraphState({ nodes, edges: [], fields, layout: 'cluster' })
		const [routed] = buildEdges(
			[{ id: 'e', source: 'a', target: 'b', kind: 'dependency', count: 3, weight: 9 }] as never,
			cards
		)
		expect(routed).toMatchObject({ count: 3, weight: 9 })
	})
})
