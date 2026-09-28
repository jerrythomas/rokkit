import { describe, it, expect } from 'vitest'
import { buildCards } from '../../src/layout/cards.js'
import { CARD_W, HEAD_H, MORE_H, PAD_B, ROW_H } from '../../src/layout/constants.js'
import type { GraphNode, GraphRow } from '../../src/types.js'

function row(name: string, badges: GraphRow['badges'] = []): GraphRow {
	return { name, type: 'text', badges }
}

function node(id: string, rows: GraphRow[]): GraphNode {
	return { id, label: id, rows, meta: {} }
}

describe('buildCards', () => {
	it('shows no rows at density names — the card is head-only', () => {
		const cards = buildCards([node('a', [row('id'), row('x')])], 'names')

		expect(cards.a.vis).toEqual([])
		expect(cards.a.more).toBe(2)
		expect(cards.a.h).toBe(HEAD_H + MORE_H + PAD_B)
	})

	it('shows only pk and fk rows at density keys', () => {
		const rows = [row('id', ['pk']), row('name'), row('owner', ['fk'])]
		const cards = buildCards([node('a', rows)], 'keys')

		expect(cards.a.vis.map((r) => r.name)).toEqual(['id', 'owner'])
		expect(cards.a.more).toBe(1)
	})

	it('shows all rows at density full', () => {
		const cards = buildCards([node('a', [row('id'), row('x')])], 'full')

		expect(cards.a.vis.map((r) => r.name)).toEqual(['id', 'x'])
		expect(cards.a.more).toBe(0)
	})

	it('caps density full at 14 rows', () => {
		const rows = Array.from({ length: 20 }, (_, i) => row(`c${i}`))
		const cards = buildCards([node('a', rows)], 'full')

		expect(cards.a.vis).toHaveLength(14)
		expect(cards.a.more).toBe(6)
	})

	it('caps density keys at 8 rows', () => {
		const rows = Array.from({ length: 12 }, (_, i) => row(`c${i}`, ['pk']))
		const cards = buildCards([node('a', rows)], 'keys')

		expect(cards.a.vis).toHaveLength(8)
		expect(cards.a.more).toBe(4)
	})

	it('derives height from the visible row count when nothing is hidden', () => {
		const cards = buildCards([node('a', [row('id'), row('x'), row('y')])], 'full')

		expect(cards.a.h).toBe(HEAD_H + 3 * ROW_H + PAD_B)
	})

	it('adds the more-row height on top of the visible rows when both are present', () => {
		// The two height cases above are each one-sided — rows with no more-row, and a
		// more-row with no rows. This is the combination, and the only case where every
		// term of the formula contributes at once.
		const cards = buildCards([node('a', Array.from({ length: 20 }, (_, i) => row(`c${i}`)))], 'full')

		expect(cards.a.h).toBe(HEAD_H + 14 * ROW_H + MORE_H + PAD_B)
	})

	it('omits the bottom pad when a card has neither rows nor a more-row', () => {
		const cards = buildCards([node('a', [])], 'full')

		expect(cards.a.h).toBe(HEAD_H)
		expect(cards.a.more).toBe(0)
	})

	it('gives every card the fixed card width and a zero origin', () => {
		const cards = buildCards([node('a', [])], 'full')

		expect(cards.a).toMatchObject({ w: CARD_W, x: 0, y: 0 })
	})

	it('keys cards by node id', () => {
		const cards = buildCards([node('public.users', []), node('public.orders', [])], 'full')

		expect(Object.keys(cards).sort()).toEqual(['public.orders', 'public.users'])
	})
})
