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

	it('caps at an explicit limit when one is given', () => {
		const rows = Array.from({ length: 20 }, (_, i) => row(`c${i}`))

		expect(buildCards([node('a', rows)], 'full', { limit: 16 }).a.vis).toHaveLength(16)
	})

	it('keeps the 14-row default when no limit is given', () => {
		// The neighbourhood layout caps its focus card at 16, the cluster layout at 14. The
		// default must not move, or every cluster card silently regrows.
		const rows = Array.from({ length: 20 }, (_, i) => row(`c${i}`))

		expect(buildCards([node('a', rows)], 'full').a.vis).toHaveLength(14)
	})

	it('applies an explicit row selector before the cap', () => {
		const rows = [row('id', ['pk']), row('a'), row('b')]
		const cards = buildCards([node('n', rows)], 'full', {
			select: (r) => r.badges.includes('pk')
		})

		expect(cards.n.vis.map((r) => r.name)).toEqual(['id'])
	})

	it('counts `more` against every row, not just the selected ones', () => {
		// The neighbourhood layout shows a neighbour only its key and referenced rows, but dbd
		// counted "+N more" against the FULL column list. Filtering a node's rows before
		// calling would report "+0 more" and drop MORE_H from the card height — so the
		// selector has to live here rather than at the call site.
		const rows = [row('id', ['pk']), row('a'), row('b')]
		const cards = buildCards([node('n', rows)], 'full', {
			select: (r) => r.badges.includes('pk')
		})

		expect(cards.n.more).toBe(2)
		expect(cards.n.h).toBe(HEAD_H + ROW_H + MORE_H + PAD_B)
	})

	it('passes the node to the selector so each card can filter on its own rows', () => {
		// Neighbour cards each reveal a DIFFERENT referenced row, so one shared predicate
		// must be able to branch per node.
		const cards = buildCards(
			[node('x', [row('keep'), row('drop')]), node('y', [row('keep'), row('drop')])],
			'full',
			{ select: (r, n) => (n.id === 'x' ? r.name === 'keep' : r.name === 'drop') }
		)

		expect(cards.x.vis.map((r) => r.name)).toEqual(['keep'])
		expect(cards.y.vis.map((r) => r.name)).toEqual(['drop'])
	})

	it('ignores the density AND the cap for an expanded node', () => {
		const rows = Array.from({ length: 20 }, (_, i) => row(`c${i}`))
		const cards = buildCards([node('a', rows)], 'names', { expanded: new Set(['a']) })

		expect(cards.a.vis).toHaveLength(20)
		expect(cards.a.more).toBe(0)
	})

	it('leaves an unexpanded node alone', () => {
		const rows = Array.from({ length: 20 }, (_, i) => row(`c${i}`))
		const cards = buildCards([node('a', rows), node('b', rows)], 'names', {
			expanded: new Set(['a'])
		})

		expect(cards.a.vis).toHaveLength(20)
		expect(cards.b.vis).toHaveLength(0)
	})

	it('keys cards by node id', () => {
		const cards = buildCards([node('public.users', []), node('public.orders', [])], 'full')

		expect(Object.keys(cards).sort()).toEqual(['public.orders', 'public.users'])
	})
})
