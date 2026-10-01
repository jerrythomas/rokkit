/* #172 — Neighborhood must look like ErDiagram on the same data: schema tint on by default, and
 * selection states that carry information. With the focus selected, every card is adjacent to
 * it by construction, so `related` / `dim` would say nothing — and ring 2 must not be dimmed
 * for being the ring the reader asked to see.
 */
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import Neighborhood from '../src/diagrams/Neighborhood.svelte'
import ErDiagram from '../src/diagrams/ErDiagram.svelte'
import { GraphState } from '../src/GraphState.svelte.js'

const nodes = [
	{ id: 'users', label: 'users', group: 'auth' },
	{ id: 'sessions', label: 'sessions', group: 'auth' },
	{ id: 'customers', label: 'customers', group: 'shop' },
	{ id: 'orders', label: 'orders', group: 'shop' }
]
// sessions → users ← customers ← orders: orders is two hops from users.
const edges = [
	{ source: 'sessions', target: 'users' },
	{ source: 'customers', target: 'users' },
	{ source: 'orders', target: 'customers' }
]
const neighborhood = (extra = {}) => new GraphState({ nodes, edges, layout: 'neighborhood', depth: 2, ...extra })

describe('selection states in neighborhood', () => {
	it('with the focus selected, the neighbours carry no related / dim state, ring 2 included', () => {
		const s = neighborhood({ value: 'users' })
		expect(s.nodeState('users')).toBe('selected')
		for (const id of ['sessions', 'customers', 'orders']) expect(s.nodeState(id), id).toBeNull()
		expect(s.routedEdges.map((e) => s.edgeState(e))).toEqual(s.routedEdges.map(() => null))
	})

	it('a selected NEIGHBOUR still lights its own adjacency', () => {
		const s = neighborhood({ focus: 'users', value: 'customers' })
		expect(s.nodeState('customers')).toBe('selected')
		expect(s.nodeState('orders')).toBe('related')
		expect(s.nodeState('sessions')).toBe('dim')
	})

	it('leaves every other layout’s selection as it was', () => {
		const s = new GraphState({ nodes, edges, layout: 'flow', value: 'users' })
		expect(s.nodeState('sessions')).toBe('related')
		expect(s.nodeState('orders')).toBe('dim')
	})
})

describe('Neighborhood — parity with ErDiagram', () => {
	const paper = (c: HTMLElement) => c.querySelector('[data-graph-paper]')!

	it('tints by schema by default, as ErDiagram does, and can turn it off', () => {
		expect(paper(render(Neighborhood, { nodes, edges, value: 'users' }).container).hasAttribute('data-graph-group-tint')).toBe(true)
		expect(paper(render(Neighborhood, { nodes, edges, value: 'users', groupTint: false }).container).hasAttribute('data-graph-group-tint')).toBe(false)
	})

	it('draws a neighbour’s card at rest exactly as ErDiagram draws it', () => {
		const card = (c: HTMLElement) => {
			const el = c.querySelector('[data-graph-node="customers"]')!
			return { state: el.getAttribute('data-node-state'), style: el.getAttribute('style')?.replace(/left:[^;]+;|top:[^;]+;|width:[^;]+;|height:[^;]+;/g, '') }
		}
		const er = card(render(ErDiagram, { nodes, edges }).container)
		const nb = card(render(Neighborhood, { nodes, edges, value: 'users', depth: 2 }).container)
		expect(nb).toEqual(er)
	})
})
