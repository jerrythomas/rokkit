/* #170, as corrected by dbd: the canvas centres the CARDS THAT ARE DRAWN by default (the 1.7.0
 * behaviour) — no column is reserved for an empty side. Centring on the focus is opt-in,
 * `centre: 'focus'`, which reserves the deeper side's reach on both sides AND reports that
 * reserved width as the extent the canvas frames.
 */
import { describe, it, expect } from 'vitest'
import { neighborhood } from '../../src/layout/neighborhood.js'
import { normalizeGraph } from '../../src/model/normalize.js'
import { GraphState } from '../../src/GraphState.svelte.js'
import { LAYOUT_OPTIONS } from '../../src/layout/options.js'

/** `a → b` edges over plain nodes. */
const nodes = (ids: string[]) => ids.map((id) => ({ id, label: id }))
const links = (pairs: [string, string][]) => pairs.map(([source, target]) => ({ source, target }))
const graph = (ids: string[], pairs: [string, string][]) => normalizeGraph(nodes(ids), links(pairs), {})

/** dbd's auth.users: referenced by sessions and customers, references nothing. */
const INBOUND_ONLY = [['users', 'sessions', 'customers'], [['sessions', 'users'], ['customers', 'users']]] as const
/** dbd's shop.order_items: references orders and products, referenced by nothing. */
const OUTBOUND_ONLY = [['items', 'orders', 'products'], [['items', 'orders'], ['items', 'products']]] as const

type Result = ReturnType<typeof neighborhood>
const cardsSpan = (r: Result) => {
	const boxes = Object.values(r.cards)
	return { left: Math.min(...boxes.map((c) => c.x)), right: Math.max(...boxes.map((c) => c.x + c.w)) }
}
const focusCentre = (r: Result, id: string) => r.cards[id].x + r.cards[id].w / 2

describe('neighborhood — centres the drawn cards by default', () => {
	it('reserves no column for an empty right side', () => {
		const r = neighborhood(graph(...(INBOUND_ONLY as never as [string[], [string, string][]])), { focus: 'users' })
		const span = cardsSpan(r)
		expect(span.left).toBe(0)
		// Only the small trailing pad, not a whole empty column.
		expect(r.size.w - span.right).toBeLessThanOrEqual(4)
	})

	it('reserves no column for an empty left side — the focus starts the canvas', () => {
		const r = neighborhood(graph(...(OUTBOUND_ONLY as never as [string[], [string, string][]])), { focus: 'items' })
		expect(r.cards.items.x).toBe(0)
		expect(r.size.w - cardsSpan(r).right).toBeLessThanOrEqual(4)
	})

	it('lets the canvas frame the drawn cards: the state’s content size is the cards’ extent', () => {
		const [ids, pairs] = INBOUND_ONLY as never as [string[], [string, string][]]
		const s = new GraphState({ nodes: nodes(ids), edges: links(pairs), layout: 'neighborhood', focus: 'users' })
		expect(s.contentSize.w).toBe(cardsSpan(neighborhood(graph(ids, pairs), { focus: 'users' })).right)
	})

	it('reports no extent of its own', () => {
		expect(neighborhood(graph(['a', 'b'], [['a', 'b']]), { focus: 'a' }).extent).toBeUndefined()
	})
})

describe("neighborhood — centre: 'focus' (opt-in)", () => {
	const focusMode = (ids: string[], pairs: [string, string][], focus: string, extra = {}) =>
		neighborhood(graph(ids, pairs), { focus, centre: 'focus', ...extra })
	const expectCentred = (r: Result, id: string) =>
		expect(Math.abs(focusCentre(r, id) - r.size.w / 2)).toBeLessThanOrEqual(1)

	it('centres the focus with inbound neighbours only', () => {
		expectCentred(focusMode(...(INBOUND_ONLY as never as [string[], [string, string][]]), 'users'), 'users')
	})

	it('centres the focus with outbound neighbours only', () => {
		expectCentred(focusMode(...(OUTBOUND_ONLY as never as [string[], [string, string][]]), 'items'), 'items')
	})

	it('centres the focus with both sides at unequal depths, at depth 2', () => {
		const r = focusMode(['f', 'in1', 'in2', 'out1'], [['in1', 'f'], ['in2', 'in1'], ['f', 'out1']], 'f', { depth: 2 })
		expect(r.cards.in2).toBeDefined()
		expectCentred(r, 'f')
	})

	it('centres the focus with a self-loop, whose room is reserved on both sides', () => {
		expectCentred(focusMode(['f', 'a'], [['a', 'f'], ['f', 'f']], 'f'), 'f')
	})

	it('reports the reserved width as its extent, so the canvas frames the focus at the centre', () => {
		const [ids, pairs] = INBOUND_ONLY as never as [string[], [string, string][]]
		const r = focusMode(ids, pairs, 'users')
		expect(r.extent).toEqual({ w: r.size.w, h: r.size.h })
		const s = new GraphState({ nodes: nodes(ids), edges: links(pairs), layout: 'neighborhood', focus: 'users', centre: 'focus' })
		expect(s.contentSize.w).toBe(r.size.w)
	})

	it('keeps each column heading over its cards', () => {
		const r = focusMode(['f', 'in1', 'in2', 'out1'], [['in1', 'f'], ['in2', 'in1'], ['f', 'out1']], 'f', { depth: 2 })
		const column = (side: string, depth: number) => r.columns!.find((c) => c.side === side && c.depth === depth)!
		expect(column('in', 2).x).toBe(r.cards.in2.x)
		expect(column('in', 1).x).toBe(r.cards.in1.x)
		expect(column('out', 1).x).toBe(r.cards.out1.x)
		expect(column('focus', 0).x).toBe(r.cards.f.x)
	})
})

describe('a single node', () => {
	it('is one card at the origin in either mode', () => {
		for (const centre of ['content', 'focus'] as const) {
			const r = neighborhood(graph(['alone'], []), { focus: 'alone', centre })
			expect(Object.keys(r.cards)).toEqual(['alone'])
			expect(Math.abs(focusCentre(r, 'alone') - r.size.w / 2)).toBeLessThanOrEqual(2)
		}
	})
})

it('lists centre as a neighborhood option', () => {
	expect(LAYOUT_OPTIONS.neighborhood).toContain('centre')
})
