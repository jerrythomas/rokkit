/* #169 — a co-change pair with no import is flagged `hidden` by the HOST; the graph only carries
 * and styles it. Like `weakest`, it is a fact about the edge, so every layout must carry it.
 */
import { describe, it, expect } from 'vitest'
import { normalizeGraph } from '../src/model/normalize.js'
import { GraphState } from '../src/GraphState.svelte.js'

const nodes = [
	{ id: 'a', label: 'a', path: ['p', 'a'] },
	{ id: 'b', label: 'b', path: ['p', 'b'] }
]

describe('normalizeGraph — hidden', () => {
	it('reads the flag from `hidden`, or from the mapped field', () => {
		expect(normalizeGraph(nodes, [{ source: 'a', target: 'b', hidden: true }], {}).edges[0].hidden).toBe(true)
		const mapped = normalizeGraph(nodes, [{ source: 'a', target: 'b', unexplained: 1 }], { hidden: 'unexplained' })
		expect(mapped.edges[0].hidden).toBe(true)
	})

	it('adds nothing to an edge without it', () => {
		const [edge] = normalizeGraph(nodes, [{ source: 'a', target: 'b', hidden: false }], {}).edges
		expect('hidden' in edge).toBe(false)
	})

	it('flags an overlay too — a hidden pair is usually observed, not declared', () => {
		const m = normalizeGraph(nodes, [{ source: 'a', target: 'b', overlay: true, hidden: true }], {})
		expect(m.overlays[0].hidden).toBe(true)
	})
})

describe.each(['cluster', 'flow', 'points', 'radial', 'structure'])('%s', (layout) => {
	it('carries the hidden flag onto the routed edge', () => {
		const s = new GraphState({ nodes, edges: [{ source: 'a', target: 'b', hidden: true }], layout, levels: 3 })
		expect(s.routedEdges.find((e) => e.fromKey === 'a' && e.toKey === 'b')?.hidden).toBe(true)
	})
})
