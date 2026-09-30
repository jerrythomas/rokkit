/* Overlay edges: drawn over the picture, never allowed to shape it.
   A co-change edge (files that change together with no import between them) or a rule
   violation is exactly the edge a reader wants to SEE and exactly the one that must not
   re-rank a layered layout — so the model keeps them apart from the start. */

import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import { normalizeGraph } from '../src/model/normalize.js'
import { GraphState } from '../src/GraphState.svelte.js'
import Graph from '../src/Graph.svelte'
import type { GraphFields } from '../src/types.js'

const NODES = [
	{ id: 'a', label: 'a' },
	{ id: 'b', label: 'b' },
	{ id: 'c', label: 'c' }
]
const IMPORTS = [
	{ source: 'a', target: 'b' },
	{ source: 'b', target: 'c' }
]
const COCHANGE = [
	{ source: 'a', target: 'c', overlay: true, relation: 'co-change', weight: 12 },
	{ source: 'c', target: 'a', overlay: true, relation: 'co-change', weight: 3 }
]

describe('normalizeGraph — overlay edges', () => {
	it('keeps overlay edges out of the structural edge list', () => {
		const model = normalizeGraph(NODES, [...IMPORTS, ...COCHANGE])
		expect(model.edges.map((e) => `${e.source}>${e.target}`)).toEqual(['a>b', 'b>c'])
		expect(model.overlays.map((e) => `${e.source}>${e.target}`)).toEqual(['a>c', 'c>a'])
		expect(model.overlays.every((e) => e.overlay === true)).toBe(true)
	})

	it('does not make overlay partners neighbours', () => {
		const model = normalizeGraph(NODES, [...IMPORTS, ...COCHANGE])
		expect([...(model.neighbors.get('a') ?? [])]).toEqual(['b'])
	})

	it('reads an edge weight', () => {
		const model = normalizeGraph(NODES, [...IMPORTS, ...COCHANGE])
		expect(model.overlays.map((e) => e.weight)).toEqual([12, 3])
		expect(model.edges[0].weight).toBeUndefined()
	})

	it('maps overlay and weight through fields', () => {
		const fields: GraphFields = { overlay: 'meta.hidden', edgeWeight: 'meta.n' }
		const model = normalizeGraph(NODES, [{ source: 'a', target: 'b', meta: { hidden: 1, n: 4 } }], fields)
		expect(model.edges).toEqual([])
		expect(model.overlays[0].weight).toBe(4)
	})

	it('treats a falsy overlay flag as structural', () => {
		const model = normalizeGraph(NODES, [{ source: 'a', target: 'b', overlay: false }])
		expect(model.edges.length).toBe(1)
		expect(model.overlays).toEqual([])
	})

	it('keeps unplaced overlay endpoints marked, like any other edge', () => {
		const model = normalizeGraph(NODES, [{ source: 'a', target: 'zzz', overlay: true }])
		expect(model.overlays[0].unplaced).toBe('target')
	})
})

describe('GraphState — overlay edges', () => {
	const make = (edges: unknown[]) => new GraphState({ nodes: NODES, edges, layout: 'flow' })

	it('lays the graph out exactly as it would without the overlay', () => {
		expect(make([...IMPORTS, ...COCHANGE]).cards).toEqual(make(IMPORTS).cards)
	})

	it('routes overlay edges between the laid-out cards, flagged', () => {
		const routed = make([...IMPORTS, ...COCHANGE]).routedEdges
		const overlays = routed.filter((e) => e.overlay)
		expect(overlays.map((e) => `${e.fromKey}>${e.toKey}`)).toEqual(['a>c', 'c>a'])
		expect(routed.filter((e) => !e.overlay).length).toBe(2)
	})

	it('does not route an overlay whose endpoint is not laid out', () => {
		const routed = make([...IMPORTS, { source: 'a', target: 'zzz', overlay: true }]).routedEdges
		expect(routed.filter((e) => e.overlay)).toEqual([])
	})

	it('normalises edge weight to 0..1 against the heaviest weighted edge', () => {
		const state = make([...IMPORTS, ...COCHANGE])
		const [heavy, light] = state.routedEdges.filter((e) => e.overlay)
		expect(state.edgeWeight(heavy)).toBe(1)
		expect(state.edgeWeight(light)).toBeCloseTo(0.25)
		expect(state.edgeWeight(state.routedEdges[0])).toBeUndefined()
	})

	it('draws every edge at the plain width when all weights are zero', () => {
		const state = make([...IMPORTS, { source: 'a', target: 'c', overlay: true, weight: 0 }])
		expect(state.edgeWeight(state.routedEdges.find((e) => e.overlay)!)).toBeUndefined()
	})

	it('keeps overlays out of relationships and reference counts', () => {
		const state = make([...IMPORTS, ...COCHANGE])
		state.select('a')
		expect(state.relationships.map((r) => r.id)).toEqual(['b'])
		expect(state.entities.find((e) => e.id === 'a')?.refCount).toBe(1)
	})

	it('exposes the overlay edges on the state', () => {
		expect(make([...IMPORTS, ...COCHANGE]).overlayEdges.length).toBe(2)
	})
})

describe('Graph — overlay edges', () => {
	it('marks overlay edges and carries their weight as a custom property', () => {
		const { container } = render(Graph, { props: { nodes: NODES, edges: [...IMPORTS, ...COCHANGE] } })
		const overlays = [...container.querySelectorAll('[data-graph-edge][data-edge-overlay]')]
		expect(overlays.length).toBe(2)
		expect(overlays[0].getAttribute('data-edge-relation')).toBe('co-change')
		expect((overlays[0] as HTMLElement).style.getPropertyValue('--edge-weight')).toBe('1')
		const plain = container.querySelector('[data-graph-edge]:not([data-edge-overlay])') as HTMLElement
		expect(plain.style.getPropertyValue('--edge-weight')).toBe('')
	})
})
