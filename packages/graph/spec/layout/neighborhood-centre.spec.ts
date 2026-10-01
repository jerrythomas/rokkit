/* #170 — the FOCUS is centred, not the canvas: whichever side is empty or deeper, the focus
 * card's centre is the canvas's horizontal centre.
 */
import { describe, it, expect } from 'vitest'
import { neighborhood } from '../../src/layout/neighborhood.js'
import { normalizeGraph } from '../../src/model/normalize.js'

/** `a → b` edges over plain nodes. */
const graph = (ids: string[], links: [string, string][]) =>
	normalizeGraph(
		ids.map((id) => ({ id, label: id })),
		links.map(([source, target]) => ({ source, target })),
		{}
	)

const focusCentre = (r: ReturnType<typeof neighborhood>, id: string) => r.cards[id].x + r.cards[id].w / 2
const expectCentred = (r: ReturnType<typeof neighborhood>, id: string) =>
	expect(Math.abs(focusCentre(r, id) - r.size.w / 2)).toBeLessThanOrEqual(1)

describe('neighborhood — the focus is centred', () => {
	it('with inbound neighbours only (referenced, references nothing)', () => {
		// dbd's auth.users: referenced by sessions and customers.
		const r = neighborhood(graph(['users', 'sessions', 'customers'], [['sessions', 'users'], ['customers', 'users']]), { focus: 'users' })
		expectCentred(r, 'users')
	})

	it('with outbound neighbours only (references, referenced by nothing)', () => {
		// dbd's shop.order_items: references orders and products.
		const r = neighborhood(graph(['items', 'orders', 'products'], [['items', 'orders'], ['items', 'products']]), { focus: 'items' })
		expectCentred(r, 'items')
	})

	it('with both sides at unequal depths, at depth 2', () => {
		// Two rings in, one ring out.
		const ids = ['f', 'in1', 'in2', 'out1']
		const r = neighborhood(graph(ids, [['in1', 'f'], ['in2', 'in1'], ['f', 'out1']]), { focus: 'f', depth: 2 })
		expect(r.cards.in2).toBeDefined()
		expectCentred(r, 'f')
	})

	it('with a self-loop, whose room is reserved on both sides', () => {
		const r = neighborhood(graph(['f', 'a'], [['a', 'f'], ['f', 'f']]), { focus: 'f' })
		expectCentred(r, 'f')
	})

	it('with no neighbours: one centred card', () => {
		const r = neighborhood(graph(['alone'], []), { focus: 'alone' })
		expect(Object.keys(r.cards)).toEqual(['alone'])
		expectCentred(r, 'alone')
	})

	it('keeps each column heading over its cards', () => {
		const ids = ['f', 'in1', 'in2', 'out1']
		const r = neighborhood(graph(ids, [['in1', 'f'], ['in2', 'in1'], ['f', 'out1']]), { focus: 'f', depth: 2 })
		const column = (side: string, depth: number) => r.columns!.find((c) => c.side === side && c.depth === depth)!
		expect(column('in', 2).x).toBe(r.cards.in2.x)
		expect(column('in', 1).x).toBe(r.cards.in1.x)
		expect(column('out', 1).x).toBe(r.cards.out1.x)
		expect(column('focus', 0).x).toBe(r.cards.f.x)
	})
})
