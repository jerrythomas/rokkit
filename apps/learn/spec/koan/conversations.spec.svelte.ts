import { describe, it, expect, beforeEach } from 'vitest'
import {
	conversations,
	startNew,
	clearAll,
	getCurrentId
} from '../../src/lib/koan/conversations.svelte'

describe('conversations — startNew dedup', () => {
	beforeEach(() => {
		clearAll()
	})

	it('app surface: same title upserts (one row, refreshed, moved to top, current)', () => {
		const first = startNew('app', 'Tabs')
		const created = conversations[0].updatedAt
		startNew('app', 'Table')
		const again = startNew('app', 'Tabs')

		const tabsRows = conversations.filter((c) => c.surface === 'app' && c.title === 'Tabs')
		expect(tabsRows.length).toBe(1)
		expect(again).toBe(first)
		expect(conversations[0].id).toBe(first)
		expect(conversations[0].turns.length).toBe(1)
		expect(getCurrentId()).toBe(first)
		expect(Date.parse(conversations[0].updatedAt)).toBeGreaterThanOrEqual(Date.parse(created))
	})

	it('app surface: different titles create separate rows', () => {
		startNew('app', 'Tabs')
		startNew('app', 'Table')
		expect(conversations.filter((c) => c.surface === 'app').length).toBe(2)
	})

	it('chat surface: same title always appends (no dedup)', () => {
		startNew('chat', 'Build a chart')
		startNew('chat', 'Build a chart')
		expect(conversations.filter((c) => c.surface === 'chat').length).toBe(2)
	})

	it('does not dedup across surfaces with the same title', () => {
		startNew('app', 'Chart')
		startNew('chat', 'Chart')
		expect(conversations.length).toBe(2)
	})
})
